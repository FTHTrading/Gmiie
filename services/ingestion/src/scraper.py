"""
Web Scraper
===========
Playwright-based web scraper for extracting full article content
from sources that don't provide RSS feeds or have incomplete feeds.

Uses trafilatura for high-quality content extraction.
"""

from __future__ import annotations

import asyncio
import re
from datetime import datetime
from typing import Any

import httpx
import trafilatura
import xxhash
from playwright.async_api import Browser, Page, async_playwright

from .config import settings
from .logger import logger
from .models import CredibilityTier, IngestedItem, SourceType


class WebScraper:
    """Playwright-based web scraper with content extraction."""

    def __init__(self) -> None:
        self._browser: Browser | None = None
        self._playwright: Any = None

    async def start(self) -> None:
        """Launch the browser instance."""
        self._playwright = await async_playwright().start()
        self._browser = await self._playwright.chromium.launch(
            headless=True,
            args=[
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
            ],
        )
        logger.info("scraper_browser_launched")

    async def stop(self) -> None:
        """Close the browser and playwright."""
        if self._browser:
            await self._browser.close()
        if self._playwright:
            await self._playwright.stop()
        logger.info("scraper_browser_closed")

    @property
    def browser(self) -> Browser:
        if not self._browser:
            raise RuntimeError("Scraper not started. Call start() first.")
        return self._browser

    async def scrape_url(
        self,
        url: str,
        source_id: str,
        source_name: str,
        credibility: str,
        selectors: dict[str, str] | None = None,
    ) -> IngestedItem | None:
        """
        Scrape a single URL and extract article content.

        Args:
            url: The URL to scrape.
            source_id: Source ID for attribution.
            source_name: Source name for logging.
            credibility: Credibility tier.
            selectors: Optional CSS selectors for custom extraction.

        Returns:
            IngestedItem if successful, None otherwise.
        """
        logger.info("scraping_url", url=url, source=source_name)

        page: Page | None = None
        try:
            page = await self.browser.new_page(
                user_agent=settings.scrape_user_agent,
                viewport={"width": 1280, "height": 720},
            )

            await page.goto(url, wait_until="networkidle", timeout=settings.scrape_timeout)

            # Wait for main content to load
            await page.wait_for_timeout(2000)

            # Get full HTML
            html = await page.content()

            # Extract using custom selectors or trafilatura
            if selectors:
                item = await self._extract_with_selectors(page, url, selectors)
            else:
                item = self._extract_with_trafilatura(html, url)

            if not item:
                logger.warning("extraction_failed", url=url)
                return None

            # Enhance with page metadata
            title = item.get("title") or await self._get_page_title(page)
            meta_desc = await self._get_meta(page, "description")
            og_image = await self._get_meta(page, "og:image")
            canonical = await self._get_canonical(page)
            author = item.get("author") or await self._get_meta(page, "author")

            content = item.get("content", "")
            clean_content = re.sub(r"<[^>]+>", "", content)

            if len(clean_content) < settings.min_content_length:
                logger.info("content_too_short", url=url, length=len(clean_content))
                return None

            content_hash = xxhash.xxh64(f"{url}:{title}:{clean_content[:500]}").hexdigest()

            return IngestedItem(
                source_id=source_id,
                source_name=source_name,
                source_type=SourceType.SCRAPE,
                credibility_tier=CredibilityTier(credibility),
                url=url,
                title=title or "Untitled",
                raw_content=content,
                clean_content=clean_content.strip(),
                author=author,
                published_at=item.get("date"),
                word_count=len(clean_content.split()),
                content_hash=content_hash,
                meta_title=title,
                meta_description=meta_desc,
                og_image=og_image,
                canonical_url=canonical,
            )

        except Exception as e:
            logger.error("scrape_failed", url=url, error=str(e))
            return None

        finally:
            if page:
                await page.close()

    def _extract_with_trafilatura(self, html: str, url: str) -> dict[str, Any] | None:
        """Extract content using trafilatura."""
        result = trafilatura.extract(
            html,
            url=url,
            include_comments=False,
            include_tables=True,
            include_images=False,
            include_links=False,
            output_format="txt",
            with_metadata=True,
        )

        if not result:
            return None

        # trafilatura returns text, get metadata separately
        metadata = trafilatura.extract(
            html,
            url=url,
            output_format="xmltei",
            with_metadata=True,
        )

        return {
            "content": result,
            "title": None,  # Will be fetched from page
            "author": None,
            "date": None,
        }

    async def _extract_with_selectors(
        self,
        page: Page,
        url: str,
        selectors: dict[str, str],
    ) -> dict[str, Any] | None:
        """Extract content using custom CSS selectors."""
        result: dict[str, Any] = {}

        for field, selector in selectors.items():
            try:
                element = await page.query_selector(selector)
                if element:
                    if field == "content":
                        result[field] = await element.inner_html()
                    else:
                        result[field] = await element.inner_text()
            except Exception:
                pass

        if "content" not in result:
            return None

        return result

    async def _get_page_title(self, page: Page) -> str | None:
        """Get the page title."""
        try:
            return await page.title()
        except Exception:
            return None

    async def _get_meta(self, page: Page, name: str) -> str | None:
        """Get a meta tag value."""
        try:
            selectors = [
                f'meta[name="{name}"]',
                f'meta[property="{name}"]',
                f'meta[property="og:{name}"]',
            ]
            for sel in selectors:
                el = await page.query_selector(sel)
                if el:
                    return await el.get_attribute("content")
        except Exception:
            pass
        return None

    async def _get_canonical(self, page: Page) -> str | None:
        """Get the canonical URL."""
        try:
            el = await page.query_selector('link[rel="canonical"]')
            if el:
                return await el.get_attribute("href")
        except Exception:
            pass
        return None

    async def scrape_source(self, source: dict[str, Any], urls: list[str]) -> list[IngestedItem]:
        """
        Scrape multiple URLs from a single source.

        Args:
            source: Source configuration.
            urls: List of URLs to scrape.

        Returns:
            List of successfully scraped items.
        """
        semaphore = asyncio.Semaphore(settings.scrape_max_concurrent)
        items: list[IngestedItem] = []

        async def _scrape_with_limit(url: str) -> IngestedItem | None:
            async with semaphore:
                return await self.scrape_url(
                    url=url,
                    source_id=source["id"],
                    source_name=source["name"],
                    credibility=source.get("credibilityTier", "TIER_3"),
                    selectors=source.get("selectors"),
                )

        results = await asyncio.gather(
            *[_scrape_with_limit(u) for u in urls],
            return_exceptions=True,
        )

        for result in results:
            if isinstance(result, IngestedItem):
                items.append(result)
            elif isinstance(result, Exception):
                logger.error("scrape_exception", error=str(result))

        return items


scraper = WebScraper()
