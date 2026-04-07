"""
US State Stablecoin & Digital Currency Monitor
================================================
Tracks state-level stablecoin legislation, CBDC pilots, digital asset
infrastructure bills, and algorithm-driven regulatory change signals
across all 50 US states + DC.

Data sources:
- State legislature RSS feeds (where available)
- Curated news feeds filtered for state stablecoin keywords
- Policy org trackers (NCSL, Brookings, Cato)
- Fed / OCC / FDIC official feeds
- Algorithm scoring: keyword density Ã— source tier Ã— recency
"""

from __future__ import annotations

import asyncio
import re
from dataclasses import dataclass, field
from datetime import datetime, timedelta
from typing import Any

import feedparser
import httpx
import xxhash

from .config import settings
from .logger import logger
from .models import CredibilityTier, IngestedItem, SourceType

# â”€â”€ US state stablecoin keyword signal set â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

STATE_STABLECOIN_KEYWORDS: list[str] = [
    # Core legislation terms
    "stablecoin", "stable coin", "digital dollar", "state digital currency",
    "electronic money", "payment stablecoin",
    # CBDC terms
    "CBDC", "central bank digital currency", "digital currency pilot",
    "FedNow stablecoin", "programmable money",
    # State-level infrastructure
    "state treasury blockchain", "state digital reserve", "state CBDC",
    "digital asset framework", "tokenized state bond", "state stablecoin reserve",
    "digital payment act", "digital currency act",
    # Major active state bills (2025-2026)
    "HB", "SB", "AB",  # paired with stablecoin context
    "Wyoming stablecoin", "Texas digital", "Florida crypto", "New York CBDC",
    "California digital currency", "Georgia blockchain",
    "Colorado digital asset", "Nevada stablecoin", "Arizona digital",
    # Regulatory infrastructure signals
    "OCC stablecoin", "FDIC stablecoin", "state bank stablecoin",
    "money transmitter digital", "BitLicense", "digital asset charter",
    "state money transmission", "payment stablecoin act",
]

# Requires at least ONE of these to be scored as stablecoin-relevant
REQUIRED_TERMS: list[str] = [
    "stablecoin", "stable coin", "digital dollar", "CBDC",
    "digital currency", "digital asset", "payment coin",
    "programmable money", "tokenized dollar",
]

# US state names and abbreviations (for geographic scoring)
US_STATES: dict[str, str] = {
    "alabama": "AL", "alaska": "AK", "arizona": "AZ", "arkansas": "AR",
    "california": "CA", "colorado": "CO", "connecticut": "CT", "delaware": "DE",
    "florida": "FL", "georgia": "GA", "hawaii": "HI", "idaho": "ID",
    "illinois": "IL", "indiana": "IN", "iowa": "IA", "kansas": "KS",
    "kentucky": "KY", "louisiana": "LA", "maine": "ME", "maryland": "MD",
    "massachusetts": "MA", "michigan": "MI", "minnesota": "MN", "mississippi": "MS",
    "missouri": "MO", "montana": "MT", "nebraska": "NE", "nevada": "NV",
    "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY",
    "north carolina": "NC", "north dakota": "ND", "ohio": "OH", "oklahoma": "OK",
    "oregon": "OR", "pennsylvania": "PA", "rhode island": "RI", "south carolina": "SC",
    "south dakota": "SD", "tennessee": "TN", "texas": "TX", "utah": "UT",
    "vermont": "VT", "virginia": "VA", "washington": "WA", "west virginia": "WV",
    "wisconsin": "WI", "wyoming": "WY", "district of columbia": "DC",
}

# â”€â”€ Feed catalog â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

# These feeds are monitored specifically for US stablecoin/digital currency signals
STABLECOIN_FEEDS: list[dict[str, Any]] = [
    # Tier 1 â€” Official government / regulator
    {
        "name": "Federal Reserve Board - Speeches & Testimony",
        "url": "https://www.federalreserve.gov/feeds/speeches.xml",
        "tier": CredibilityTier.TIER_1,
        "source_type": SourceType.RSS,
        "weight": 2.5,           # Score multiplier for this source
    },
    {
        "name": "OCC Interpretive Letters & Bulletins",
        "url": "https://www.occ.gov/rss/news.xml",
        "tier": CredibilityTier.TIER_1,
        "source_type": SourceType.RSS,
        "weight": 2.5,
    },
    {
        "name": "SEC News - Digital Assets",
        "url": "https://www.sec.gov/rss/news/press.xml",
        "tier": CredibilityTier.TIER_1,
        "source_type": SourceType.RSS,
        "weight": 2.0,
    },
    {
        "name": "FDIC Press Releases",
        "url": "https://www.fdic.gov/news/rss/press-releases.xml",
        "tier": CredibilityTier.TIER_1,
        "source_type": SourceType.RSS,
        "weight": 2.0,
    },
    {
        "name": "Wyoming Legislature News",
        "url": "https://wyoleg.gov/News/rss.aspx",
        "tier": CredibilityTier.TIER_1,
        "source_type": SourceType.RSS,
        "weight": 2.0,
        "state": "WY",
    },
    # Tier 2 â€” Major institutional press / policy orgs
    {
        "name": "American Banker - Digital Banking",
        "url": "https://feeds.americanbanker.com/americanbanker/digital-banking",
        "tier": CredibilityTier.TIER_2,
        "source_type": SourceType.RSS,
        "weight": 1.8,
    },
    {
        "name": "NCSL - Financial Services",
        "url": "https://www.ncsl.org/rss/financial-services.xml",
        "tier": CredibilityTier.TIER_2,
        "source_type": SourceType.RSS,
        "weight": 1.8,
    },
    {
        "name": "Brookings - Digital Finance",
        "url": "https://www.brookings.edu/topic/digital-currency/feed/",
        "tier": CredibilityTier.TIER_2,
        "source_type": SourceType.RSS,
        "weight": 1.6,
    },
    {
        "name": "Cato Institute - Monetary Policy",
        "url": "https://www.cato.org/rss/monetary-fiscal-policy",
        "tier": CredibilityTier.TIER_2,
        "source_type": SourceType.RSS,
        "weight": 1.5,
    },
    {
        "name": "Reuters - Stablecoin & CBDC",
        "url": "https://feeds.reuters.com/reuters/businessNews",
        "tier": CredibilityTier.TIER_2,
        "source_type": SourceType.RSS,
        "weight": 1.6,
    },
    {
        "name": "Bloomberg Law - Banking",
        "url": "https://feeds.bloomberglaw.com/banking-law",
        "tier": CredibilityTier.TIER_2,
        "source_type": SourceType.RSS,
        "weight": 1.7,
    },
    # Tier 3 â€” Crypto-native (signal value)
    {
        "name": "CoinDesk",
        "url": "https://www.coindesk.com/arc/outboundfeeds/rss/",
        "tier": CredibilityTier.TIER_3,
        "source_type": SourceType.RSS,
        "weight": 1.2,
    },
    {
        "name": "The Block",
        "url": "https://www.theblock.co/rss.xml",
        "tier": CredibilityTier.TIER_3,
        "source_type": SourceType.RSS,
        "weight": 1.2,
    },
    {
        "name": "Blockworks",
        "url": "https://blockworks.co/feed",
        "tier": CredibilityTier.TIER_3,
        "source_type": SourceType.RSS,
        "weight": 1.1,
    },
    {
        "name": "CoinTelegraph - Regulation",
        "url": "https://cointelegraph.com/rss/tag/regulation",
        "tier": CredibilityTier.TIER_3,
        "source_type": SourceType.RSS,
        "weight": 1.1,
    },
    {
        "name": "Decrypt - Policy",
        "url": "https://decrypt.co/feed",
        "tier": CredibilityTier.TIER_3,
        "source_type": SourceType.RSS,
        "weight": 1.0,
    },
]


@dataclass
class StablecoinSignal:
    """A detected state stablecoin signal."""

    title: str
    url: str
    summary: str
    source_name: str
    source_tier: CredibilityTier
    state_codes: list[str]           # US states mentioned (e.g. ["TX", "WY"])
    keywords_matched: list[str]
    raw_score: float                 # 0â€“10 importance estimate
    detected_at: datetime
    published_at: datetime | None = None
    feed_url: str = ""

    def to_ingested_item(self) -> IngestedItem:
        content = f"{self.title}. {self.summary}"
        return IngestedItem(
            title=self.title,
            url=self.url,
            raw_content=content,
            source_id="stablecoin-monitor",
            source_name=self.source_name,
            source_type=self.source_tier,
            credibility_tier=self.source_tier,
            published_at=self.published_at or self.detected_at,
            content_hash=xxhash.xxh64(f"{self.url}:{self.title}").hexdigest(),
            metadata={
                "state_codes": self.state_codes,
                "keywords_matched": self.keywords_matched,
                "raw_score": self.raw_score,
                "monitor": "stablecoin",
            },
        )


class StateStablecoinMonitor:
    """
    Monitors news feeds and government sources for US state
    stablecoin / digital currency legislative signals.

    Scoring algorithm:
      base_score = keyword_density_score (0â€“5)
      Ã— source_weight (tier multiplier)
      + state_specificity_bonus (0â€“2)
      + recency_bonus (0â€“1)
      â†’ normalized to 0â€“10
    """

    def __init__(self) -> None:
        self._client: httpx.AsyncClient | None = None
        self._seen: set[str] = set()    # content hashes of processed items

    async def start(self) -> None:
        self._client = httpx.AsyncClient(
            timeout=httpx.Timeout(30.0),
            headers={"User-Agent": settings.scrape_user_agent},
            follow_redirects=True,
        )
        logger.info("stablecoin_monitor_started", feeds=len(STABLECOIN_FEEDS))

    async def stop(self) -> None:
        if self._client:
            await self._client.aclose()
        logger.info("stablecoin_monitor_stopped")

    @property
    def client(self) -> httpx.AsyncClient:
        if not self._client:
            raise RuntimeError("StablecoinMonitor not started")
        return self._client

    async def run_cycle(self) -> list[StablecoinSignal]:
        """Poll all feeds and return new stablecoin signals above threshold."""
        logger.info("stablecoin_cycle_start", feeds=len(STABLECOIN_FEEDS))
        tasks = [self._poll_feed(feed) for feed in STABLECOIN_FEEDS]
        results = await asyncio.gather(*tasks, return_exceptions=True)

        signals: list[StablecoinSignal] = []
        for result in results:
            if isinstance(result, Exception):
                logger.warning("stablecoin_feed_error", error=str(result))
                continue
            signals.extend(result)

        # Deduplicate
        unique: list[StablecoinSignal] = []
        for sig in signals:
            key = xxhash.xxh64(f"{sig.url}:{sig.title}").hexdigest()
            if key not in self._seen:
                self._seen.add(key)
                unique.append(sig)

        # Sort by score descending
        unique.sort(key=lambda s: s.raw_score, reverse=True)

        logger.info(
            "stablecoin_cycle_complete",
            total_signals=len(signals),
            unique=len(unique),
        )
        return unique

    async def _poll_feed(self, feed_cfg: dict[str, Any]) -> list[StablecoinSignal]:
        try:
            resp = await self.client.get(feed_cfg["url"])
            resp.raise_for_status()
        except Exception as e:
            logger.warning("stablecoin_feed_fetch_failed", feed=feed_cfg["name"], error=str(e))
            return []

        parsed = feedparser.parse(resp.text)
        signals: list[StablecoinSignal] = []

        for entry in parsed.entries:
            title = getattr(entry, "title", "") or ""
            summary = getattr(entry, "summary", "") or getattr(entry, "description", "") or ""
            url = getattr(entry, "link", "") or ""
            if not title or not url:
                continue

            # Check relevance
            text = f"{title} {summary}".lower()
            matched = self._match_keywords(text)
            if not matched:
                continue

            # Detect states mentioned
            state_codes = self._detect_states(text)

            # Score
            score = self._compute_score(
                title=title,
                text=text,
                matched_keywords=matched,
                state_codes=state_codes,
                source_weight=feed_cfg.get("weight", 1.0),
                published_at=self._parse_date(entry),
            )

            # Only emit if score â‰¥ 5.0 (midpoint threshold)
            if score < 5.0:
                continue

            signals.append(
                StablecoinSignal(
                    title=title,
                    url=url,
                    summary=summary[:800],
                    source_name=feed_cfg["name"],
                    source_tier=feed_cfg["tier"],
                    state_codes=state_codes or feed_cfg.get("state", []),
                    keywords_matched=matched,
                    raw_score=score,
                    detected_at=datetime.utcnow(),
                    published_at=self._parse_date(entry),
                    feed_url=feed_cfg["url"],
                )
            )

        return signals

    def _match_keywords(self, text: str) -> list[str]:
        """Return list of matched keywords if text is stablecoin-relevant."""
        # Must match at least one required term
        has_required = any(
            term.lower() in text for term in REQUIRED_TERMS
        )
        if not has_required:
            return []

        matched = [kw for kw in STATE_STABLECOIN_KEYWORDS if kw.lower() in text]
        return matched

    def _detect_states(self, text: str) -> list[str]:
        """Detect US state names/abbreviations in text."""
        codes: list[str] = []
        for state_name, abbrev in US_STATES.items():
            if state_name in text:
                codes.append(abbrev)
            # Also check 2-letter abbreviation with word boundaries
            elif re.search(rf"\b{abbrev}\b", text.upper()):
                codes.append(abbrev)
        return list(set(codes))

    def _compute_score(
        self,
        title: str,
        text: str,
        matched_keywords: list[str],
        state_codes: list[str],
        source_weight: float,
        published_at: datetime | None,
    ) -> float:
        """
        Score formula:
          keyword_score = min(len(matched) * 0.6, 4.0)   # keyword density
          title_boost   = +1.5 if any required term in title
          state_bonus   = min(len(state_codes) * 0.5, 2.0)
          recency_bonus = 1.0 if < 6h old, 0.5 if < 24h, 0 otherwise
          raw = (keyword_score + title_boost + state_bonus + recency_bonus) Ã— source_weight
          â†’ clamped to 0â€“10
        """
        keyword_score = min(len(matched_keywords) * 0.6, 4.0)

        title_lower = title.lower()
        title_boost = 1.5 if any(t.lower() in title_lower for t in REQUIRED_TERMS) else 0.0

        state_bonus = min(len(state_codes) * 0.5, 2.0)

        recency_bonus = 0.0
        if published_at:
            age = datetime.utcnow() - published_at.replace(tzinfo=None)
            if age < timedelta(hours=6):
                recency_bonus = 1.0
            elif age < timedelta(hours=24):
                recency_bonus = 0.5

        raw = (keyword_score + title_boost + state_bonus + recency_bonus) * source_weight
        return round(min(raw, 10.0), 2)

    @staticmethod
    def _parse_date(entry: Any) -> datetime | None:
        if hasattr(entry, "published_parsed") and entry.published_parsed:
            try:
                return datetime(*entry.published_parsed[:6])
            except Exception:
                pass
        return None


# Module-level singleton
stablecoin_monitor = StateStablecoinMonitor()
