"""
Deduplication Engine
====================
Multi-strategy deduplication to prevent duplicate content:
1. URL normalization and exact match
2. Content hash comparison (xxhash)
3. Title similarity (fuzzy matching)
"""

from __future__ import annotations

import re
from difflib import SequenceMatcher
from urllib.parse import urlparse, urlunparse, parse_qs, urlencode

from .config import settings
from .database import db
from .logger import logger
from .models import DedupResult, IngestedItem


class DeduplicationEngine:
    """Multi-strategy content deduplication."""

    # URL parameters to strip for normalization
    STRIP_PARAMS = {
        "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
        "ref", "source", "via", "fbclid", "gclid", "mc_cid", "mc_eid",
    }

    def normalize_url(self, url: str) -> str:
        """Normalize a URL for comparison."""
        parsed = urlparse(url)

        # Lowercase scheme and host
        scheme = parsed.scheme.lower()
        netloc = parsed.netloc.lower()

        # Remove www prefix
        if netloc.startswith("www."):
            netloc = netloc[4:]

        # Remove trailing slash from path
        path = parsed.path.rstrip("/")
        if not path:
            path = "/"

        # Strip tracking parameters
        params = parse_qs(parsed.query)
        clean_params = {
            k: v for k, v in params.items()
            if k.lower() not in self.STRIP_PARAMS
        }
        query = urlencode(clean_params, doseq=True)

        # Remove fragment
        return urlunparse((scheme, netloc, path, "", query, ""))

    def title_similarity(self, title_a: str, title_b: str) -> float:
        """Calculate fuzzy similarity between two titles."""
        # Normalize titles
        a = re.sub(r"[^\w\s]", "", title_a.lower()).strip()
        b = re.sub(r"[^\w\s]", "", title_b.lower()).strip()

        if not a or not b:
            return 0.0

        return SequenceMatcher(None, a, b).ratio()

    async def check_duplicate(self, item: IngestedItem) -> DedupResult:
        """
        Check if an item is a duplicate using multiple strategies.

        Strategy order:
        1. Exact URL match (after normalization)
        2. Content hash match
        3. Title similarity above threshold

        Returns:
            DedupResult with is_duplicate flag and match details.
        """
        normalized_url = self.normalize_url(str(item.url))

        # Strategy 1: URL match
        url_exists = await db.check_url_exists(normalized_url)
        if url_exists:
            logger.debug("dedup_url_match", url=normalized_url)
            return DedupResult(
                is_duplicate=True,
                similarity_score=1.0,
                matched_url=normalized_url,
                method="url_exact",
            )

        # Also check original URL
        if str(item.url) != normalized_url:
            orig_exists = await db.check_url_exists(str(item.url))
            if orig_exists:
                return DedupResult(
                    is_duplicate=True,
                    similarity_score=1.0,
                    matched_url=str(item.url),
                    method="url_original",
                )

        # Strategy 2: Content hash
        if item.content_hash:
            hash_exists = await db.check_hash_exists(item.content_hash)
            if hash_exists:
                logger.debug("dedup_hash_match", hash=item.content_hash)
                return DedupResult(
                    is_duplicate=True,
                    similarity_score=1.0,
                    method="content_hash",
                )

        # Strategy 3: Title similarity (check recent articles)
        # This is more expensive, so we only check within a window
        # In production, this would query recent titles from DB
        # For now, this is a placeholder for the title-similarity check

        return DedupResult(
            is_duplicate=False,
            similarity_score=0.0,
            method="no_match",
        )

    async def filter_duplicates(
        self,
        items: list[IngestedItem],
    ) -> tuple[list[IngestedItem], list[IngestedItem]]:
        """
        Filter a list of items, separating unique from duplicates.

        Returns:
            Tuple of (unique_items, duplicate_items).
        """
        unique: list[IngestedItem] = []
        duplicates: list[IngestedItem] = []

        # Also check within the batch itself
        seen_hashes: set[str] = set()
        seen_urls: set[str] = set()

        for item in items:
            # Batch-level dedup
            norm_url = self.normalize_url(str(item.url))
            if norm_url in seen_urls:
                duplicates.append(item)
                continue
            if item.content_hash and item.content_hash in seen_hashes:
                duplicates.append(item)
                continue

            # Database-level dedup
            result = await self.check_duplicate(item)
            if result.is_duplicate:
                duplicates.append(item)
                logger.debug(
                    "duplicate_found",
                    title=item.title[:60],
                    method=result.method,
                    score=result.similarity_score,
                )
            else:
                unique.append(item)
                seen_urls.add(norm_url)
                if item.content_hash:
                    seen_hashes.add(item.content_hash)

        logger.info(
            "dedup_complete",
            total=len(items),
            unique=len(unique),
            duplicates=len(duplicates),
        )

        return unique, duplicates


dedup_engine = DeduplicationEngine()
