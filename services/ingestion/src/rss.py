"""
RSS/Atom Feed Poller
====================
Polls configured RSS/Atom feeds, extracts entries,
normalizes content, and dispatches to processing queue.
"""

from __future__ import annotations

import asyncio
from datetime import datetime
from typing import Any

import dateparser
import feedparser
import httpx
import xxhash

from .config import settings
from .logger import logger
from .models import CredibilityTier, IngestedItem, SourceType


class RSSPoller:
    """Polls RSS/Atom feeds and extracts structured content."""

    def __init__(self) -> None:
        self._client: httpx.AsyncClient | None = None

    async def start(self) -> None:
        """Initialize the HTTP client."""
        self._client = httpx.AsyncClient(
            timeout=httpx.Timeout(30.0),
            headers={"User-Agent": settings.scrape_user_agent},
            follow_redirects=True,
        )
        logger.info("rss_poller_started")

    async def stop(self) -> None:
        """Close the HTTP client."""
        if self._client:
            await self._client.aclose()
            logger.info("rss_poller_stopped")

    @property
    def client(self) -> httpx.AsyncClient:
        if not self._client:
            raise RuntimeError("RSS poller not started. Call start() first.")
        return self._client

    async def poll_feed(self, source: dict[str, Any]) -> list[IngestedItem]:
        """
        Poll a single RSS/Atom feed and return extracted items.

        Args:
            source: Source configuration dict from database.

        Returns:
            List of IngestedItem objects.
        """
        source_id = source["id"]
        source_name = source["name"]
        url = source["url"]
        credibility = source.get("credibilityTier", "TIER_3")

        logger.info("polling_feed", source=source_name, url=url)

        try:
            response = await self.client.get(url)
            response.raise_for_status()
        except httpx.HTTPError as e:
            logger.error("feed_fetch_failed", source=source_name, error=str(e))
            return []

        # Parse feed
        feed = feedparser.parse(response.text)

        if feed.bozo and not feed.entries:
            logger.warning("feed_parse_error", source=source_name, error=str(feed.bozo_exception))
            return []

        items: list[IngestedItem] = []
        for entry in feed.entries:
            try:
                item = self._extract_entry(entry, source_id, source_name, credibility)
                if item and len(item.raw_content) >= settings.min_content_length:
                    items.append(item)
            except Exception as e:
                logger.warning(
                    "entry_extraction_failed",
                    source=source_name,
                    title=getattr(entry, "title", "unknown"),
                    error=str(e),
                )

        logger.info("feed_polled", source=source_name, items_found=len(items))
        return items

    def _extract_entry(
        self,
        entry: Any,
        source_id: str,
        source_name: str,
        credibility: str,
    ) -> IngestedItem | None:
        """Extract a single feed entry into an IngestedItem."""
        url = getattr(entry, "link", None)
        title = getattr(entry, "title", None)

        if not url or not title:
            return None

        # Extract content (prefer content over summary)
        content = ""
        if hasattr(entry, "content") and entry.content:
            content = entry.content[0].get("value", "")
        elif hasattr(entry, "summary"):
            content = entry.summary or ""
        elif hasattr(entry, "description"):
            content = entry.description or ""

        # Parse published date
        published_at = None
        published_str = getattr(entry, "published", None) or getattr(entry, "updated", None)
        if published_str:
            published_at = dateparser.parse(published_str)

        # Extract author
        author = None
        if hasattr(entry, "author"):
            author = entry.author
        elif hasattr(entry, "authors") and entry.authors:
            author = entry.authors[0].get("name")

        # Extract tags
        tags: list[str] = []
        if hasattr(entry, "tags"):
            tags = [t.get("term", "") for t in entry.tags if t.get("term")]

        # Generate content hash
        content_hash = xxhash.xxh64(f"{url}:{title}:{content[:500]}").hexdigest()

        # Word count
        import re
        clean_text = re.sub(r"<[^>]+>", "", content)
        word_count = len(clean_text.split())

        return IngestedItem(
            source_id=source_id,
            source_name=source_name,
            source_type=SourceType.RSS,
            credibility_tier=CredibilityTier(credibility),
            url=url,
            title=title.strip(),
            raw_content=content,
            clean_content=clean_text.strip(),
            author=author,
            published_at=published_at,
            word_count=word_count,
            content_hash=content_hash,
            tags=tags,
        )

    async def poll_all_feeds(self, sources: list[dict[str, Any]]) -> list[IngestedItem]:
        """
        Poll all RSS sources concurrently.

        Args:
            sources: List of source configs from database.

        Returns:
            Combined list of all extracted items.
        """
        rss_sources = [s for s in sources if s.get("sourceType") == "RSS"]
        logger.info("polling_all_feeds", count=len(rss_sources))

        # Poll concurrently with semaphore for rate limiting
        semaphore = asyncio.Semaphore(settings.scrape_max_concurrent)

        async def _poll_with_limit(source: dict[str, Any]) -> list[IngestedItem]:
            async with semaphore:
                return await self.poll_feed(source)

        results = await asyncio.gather(
            *[_poll_with_limit(s) for s in rss_sources],
            return_exceptions=True,
        )

        items: list[IngestedItem] = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(
                    "feed_poll_exception",
                    source=rss_sources[i]["name"],
                    error=str(result),
                )
            elif isinstance(result, list):
                items.extend(result)

        logger.info("all_feeds_polled", total_items=len(items))
        return items


rss_poller = RSSPoller()
