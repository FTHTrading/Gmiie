"""
Data models for the ingestion pipeline.
Pydantic models for validation, serialization, and type safety.
"""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field, HttpUrl


# ─── Source Configuration ─────────────────────────────────────────

class SourceType(str, Enum):
    RSS = "RSS"
    SCRAPE = "SCRAPE"
    API = "API"
    SITEMAP = "SITEMAP"
    MANUAL = "MANUAL"


class ScrapeMethod(str, Enum):
    PLAYWRIGHT = "PLAYWRIGHT"
    HTTPX = "HTTPX"
    TRAFILATURA = "TRAFILATURA"
    API_CLIENT = "API_CLIENT"
    RSS_NATIVE = "RSS_NATIVE"
    SITEMAP_PARSER = "SITEMAP_PARSER"


class CredibilityTier(str, Enum):
    TIER_1 = "TIER_1"  # Central banks, regulators, exchanges
    TIER_2 = "TIER_2"  # Major financial media, research firms
    TIER_3 = "TIER_3"  # Industry publications, analysts
    TIER_4 = "TIER_4"  # Blogs, social, unverified


class SourceConfig(BaseModel):
    """Configuration for a content source."""
    id: str
    name: str
    url: HttpUrl
    source_type: SourceType
    scrape_method: ScrapeMethod
    credibility_tier: CredibilityTier
    poll_interval_seconds: int = 900
    selectors: dict[str, str] | None = None
    headers: dict[str, str] | None = None
    enabled: bool = True
    tags: list[str] = Field(default_factory=list)
    region: str | None = None
    language: str = "en"


# ─── Ingested Content ─────────────────────────────────────────────

class IngestedItem(BaseModel):
    """Raw item extracted from a source."""
    source_id: str
    source_name: str
    source_type: SourceType
    credibility_tier: CredibilityTier

    url: HttpUrl
    title: str
    raw_content: str
    clean_content: str | None = None
    summary: str | None = None

    author: str | None = None
    published_at: datetime | None = None
    discovered_at: datetime = Field(default_factory=datetime.utcnow)

    language: str = "en"
    word_count: int = 0
    content_hash: str = ""

    # Extracted metadata
    meta_title: str | None = None
    meta_description: str | None = None
    og_image: str | None = None
    canonical_url: str | None = None
    tags: list[str] = Field(default_factory=list)
    categories: list[str] = Field(default_factory=list)

    raw_metadata: dict[str, Any] = Field(default_factory=dict)


# ─── Deduplication ─────────────────────────────────────────────────

class DedupResult(BaseModel):
    """Result of deduplication check."""
    is_duplicate: bool
    similarity_score: float = 0.0
    matched_url: str | None = None
    matched_article_id: str | None = None
    method: str = ""  # hash, title_sim, url_norm


# ─── Dispatch ──────────────────────────────────────────────────────

class DispatchPayload(BaseModel):
    """Payload dispatched to the processing queue."""
    job_id: str
    job_type: str = "classify_and_draft"
    item: IngestedItem
    priority: int = 5  # 1=highest, 10=lowest
    retry_count: int = 0
    max_retries: int = 3
    created_at: datetime = Field(default_factory=datetime.utcnow)


# ─── Source Health ─────────────────────────────────────────────────

class SourceHealth(BaseModel):
    """Health status of a source."""
    source_id: str
    last_poll_at: datetime | None = None
    last_success_at: datetime | None = None
    consecutive_failures: int = 0
    total_items_ingested: int = 0
    avg_items_per_poll: float = 0.0
    is_healthy: bool = True
    last_error: str | None = None
