"""
Ingestion service configuration.
Loads from environment variables and .env file.
"""

from __future__ import annotations

from enum import Enum
from pydantic import Field
from pydantic_settings import BaseSettings


class Environment(str, Enum):
    DEVELOPMENT = "development"
    STAGING = "staging"
    PRODUCTION = "production"


class Settings(BaseSettings):
    """Global settings for the ingestion service."""

    environment: Environment = Environment.DEVELOPMENT

    # Database
    database_url: str = Field(default="postgresql://localhost:5432/xxxiii")

    # Redis
    redis_url: str = Field(default="redis://localhost:6379/0")

    # Polling intervals (seconds)
    rss_poll_interval: int = Field(default=900, description="RSS poll interval in seconds")
    scrape_interval: int = Field(default=3600, description="Web scrape interval in seconds")
    api_poll_interval: int = Field(default=1800, description="API poll interval in seconds")

    # Scraping
    scrape_timeout: int = Field(default=30000, description="Playwright page timeout in ms")
    scrape_max_concurrent: int = Field(default=5, description="Max concurrent scrape tasks")
    scrape_user_agent: str = Field(
        default="XXXIII-Bot/1.0 (https://xxxiii.io; research@xxxiii.io)",
        description="User agent for scraping",
    )
    respect_robots_txt: bool = Field(default=True)

    # Deduplication
    dedup_similarity_threshold: float = Field(
        default=0.85,
        description="Cosine similarity threshold for deduplication",
    )
    dedup_window_hours: int = Field(default=72, description="Hours to look back for duplicates")

    # Content extraction
    min_content_length: int = Field(default=200, description="Minimum content length to accept")
    max_content_length: int = Field(default=50000, description="Maximum content length")

    # Rate limiting
    rate_limit_requests_per_minute: int = Field(default=30)
    rate_limit_burst: int = Field(default=10)

    # Logging
    log_level: str = Field(default="INFO")
    log_json: bool = Field(default=False)

    model_config = {"env_file": "../../.env", "env_prefix": "INGESTION_"}


settings = Settings()
