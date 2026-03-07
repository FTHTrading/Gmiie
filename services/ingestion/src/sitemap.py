"""
Sitemap Crawler
===============
Discovers and crawls sitemaps from configured sources
to find new URLs for content ingestion.
"""

from __future__ import annotations

import asyncio
from datetime import datetime
from typing import Any
from xml.etree import ElementTree

import httpx

from .config import settings
from .logger import logger


class SitemapCrawler:
    """Discovers URLs from XML sitemaps for ingestion."""

    SITEMAP_NS = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}

    def __init__(self) -> None:
        self._client: httpx.AsyncClient | None = None

    async def start(self) -> None:
        self._client = httpx.AsyncClient(
            timeout=httpx.Timeout(30.0),
            headers={"User-Agent": settings.scrape_user_agent},
            follow_redirects=True,
        )

    async def stop(self) -> None:
        if self._client:
            await self._client.aclose()

    @property
    def client(self) -> httpx.AsyncClient:
        if not self._client:
            raise RuntimeError("Sitemap crawler not started")
        return self._client

    async def discover_urls(
        self,
        sitemap_url: str,
        max_urls: int = 100,
        since: datetime | None = None,
    ) -> list[dict[str, Any]]:
        """
        Parse a sitemap and return discovered URLs.

        Handles:
        - Standard sitemaps
        - Sitemap indexes
        - News sitemaps

        Args:
            sitemap_url: URL of the sitemap XML.
            max_urls: Maximum URLs to return.
            since: Only return URLs modified after this date.

        Returns:
            List of dicts with 'url', 'lastmod', 'priority', 'changefreq'.
        """
        logger.info("crawling_sitemap", url=sitemap_url)

        try:
            response = await self.client.get(sitemap_url)
            response.raise_for_status()
        except httpx.HTTPError as e:
            logger.error("sitemap_fetch_failed", url=sitemap_url, error=str(e))
            return []

        try:
            root = ElementTree.fromstring(response.text)
        except ElementTree.ParseError as e:
            logger.error("sitemap_parse_failed", url=sitemap_url, error=str(e))
            return []

        tag = root.tag.lower()

        # Handle sitemap index
        if "sitemapindex" in tag:
            return await self._process_sitemap_index(root, max_urls, since)

        # Handle regular sitemap
        return self._process_sitemap(root, max_urls, since)

    async def _process_sitemap_index(
        self,
        root: ElementTree.Element,
        max_urls: int,
        since: datetime | None,
    ) -> list[dict[str, Any]]:
        """Process a sitemap index file."""
        sitemap_urls = []
        for sitemap in root.findall("sm:sitemap", self.SITEMAP_NS):
            loc = sitemap.find("sm:loc", self.SITEMAP_NS)
            if loc is not None and loc.text:
                sitemap_urls.append(loc.text)

        # Crawl child sitemaps concurrently
        all_urls: list[dict[str, Any]] = []
        semaphore = asyncio.Semaphore(3)

        async def _crawl(url: str) -> list[dict[str, Any]]:
            async with semaphore:
                return await self.discover_urls(url, max_urls=max_urls, since=since)

        results = await asyncio.gather(
            *[_crawl(u) for u in sitemap_urls[:10]],  # Limit to 10 sub-sitemaps
            return_exceptions=True,
        )

        for result in results:
            if isinstance(result, list):
                all_urls.extend(result)

        return all_urls[:max_urls]

    def _process_sitemap(
        self,
        root: ElementTree.Element,
        max_urls: int,
        since: datetime | None,
    ) -> list[dict[str, Any]]:
        """Process a standard sitemap."""
        urls: list[dict[str, Any]] = []

        for url_element in root.findall("sm:url", self.SITEMAP_NS):
            loc = url_element.find("sm:loc", self.SITEMAP_NS)
            if not loc or not loc.text:
                continue

            lastmod_el = url_element.find("sm:lastmod", self.SITEMAP_NS)
            lastmod = None
            if lastmod_el is not None and lastmod_el.text:
                try:
                    lastmod = datetime.fromisoformat(lastmod_el.text.replace("Z", "+00:00"))
                except ValueError:
                    pass

            # Filter by date if specified
            if since and lastmod and lastmod < since:
                continue

            priority_el = url_element.find("sm:priority", self.SITEMAP_NS)
            changefreq_el = url_element.find("sm:changefreq", self.SITEMAP_NS)

            urls.append({
                "url": loc.text,
                "lastmod": lastmod,
                "priority": float(priority_el.text) if priority_el is not None else 0.5,
                "changefreq": changefreq_el.text if changefreq_el is not None else None,
            })

        # Sort by lastmod (newest first)
        urls.sort(key=lambda x: x.get("lastmod") or datetime.min, reverse=True)

        logger.info("sitemap_urls_found", count=len(urls))
        return urls[:max_urls]


sitemap_crawler = SitemapCrawler()
