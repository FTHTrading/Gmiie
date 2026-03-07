"""
API Feed Integrations
=====================
Direct API clients for structured data sources:
- SEC EDGAR (filings, company data)
- Federal Reserve (FRED economic data)
- CoinGecko/CoinMarketCap (crypto market data)
- Custom REST API endpoints
"""

from __future__ import annotations

import asyncio
from datetime import datetime
from typing import Any

import httpx
import xxhash

from .config import settings
from .logger import logger
from .models import CredibilityTier, IngestedItem, SourceType


class SECEdgarClient:
    """SEC EDGAR API client for filing and company data."""

    BASE_URL = "https://efts.sec.gov/LATEST/search-index"
    FILING_URL = "https://efts.sec.gov/LATEST/search-index"
    FULL_TEXT_URL = "https://efts.sec.gov/LATEST"

    def __init__(self) -> None:
        self._client: httpx.AsyncClient | None = None

    async def start(self) -> None:
        self._client = httpx.AsyncClient(
            timeout=httpx.Timeout(30.0),
            headers={
                "User-Agent": settings.scrape_user_agent,
                "Accept": "application/json",
            },
        )

    async def stop(self) -> None:
        if self._client:
            await self._client.aclose()

    @property
    def client(self) -> httpx.AsyncClient:
        if not self._client:
            raise RuntimeError("SEC client not started")
        return self._client

    async def search_filings(
        self,
        query: str = "tokenized securities OR digital assets OR blockchain",
        form_types: list[str] | None = None,
        date_from: str | None = None,
        limit: int = 20,
    ) -> list[IngestedItem]:
        """Search SEC EDGAR full-text search API."""
        params: dict[str, Any] = {
            "q": query,
            "dateRange": "custom",
            "startdt": date_from or "2024-01-01",
            "enddt": datetime.utcnow().strftime("%Y-%m-%d"),
        }

        if form_types:
            params["forms"] = ",".join(form_types)

        try:
            response = await self.client.get(
                "https://efts.sec.gov/LATEST/search-index",
                params=params,
            )

            if response.status_code != 200:
                logger.warning("sec_search_failed", status=response.status_code)
                return []

            data = response.json()
            hits = data.get("hits", {}).get("hits", [])

            items = []
            for hit in hits[:limit]:
                source_data = hit.get("_source", {})
                url = f"https://www.sec.gov/Archives/edgar/data/{source_data.get('file_num', '')}"
                title = source_data.get("display_names", ["SEC Filing"])[0]
                content = source_data.get("text", "")

                if not content:
                    continue

                content_hash = xxhash.xxh64(f"{url}:{title}").hexdigest()

                items.append(IngestedItem(
                    source_id="sec-edgar",
                    source_name="SEC EDGAR",
                    source_type=SourceType.API,
                    credibility_tier=CredibilityTier.TIER_1,
                    url=url,
                    title=title,
                    raw_content=content,
                    clean_content=content,
                    word_count=len(content.split()),
                    content_hash=content_hash,
                    tags=["sec", "filing", "regulatory"],
                ))

            logger.info("sec_filings_found", count=len(items))
            return items

        except Exception as e:
            logger.error("sec_search_error", error=str(e))
            return []


class FREDClient:
    """Federal Reserve Economic Data API client."""

    BASE_URL = "https://api.stlouisfed.org/fred"

    def __init__(self, api_key: str = "") -> None:
        self.api_key = api_key
        self._client: httpx.AsyncClient | None = None

    async def start(self) -> None:
        self._client = httpx.AsyncClient(timeout=httpx.Timeout(30.0))

    async def stop(self) -> None:
        if self._client:
            await self._client.aclose()

    @property
    def client(self) -> httpx.AsyncClient:
        if not self._client:
            raise RuntimeError("FRED client not started")
        return self._client

    async def get_series_observations(
        self,
        series_id: str,
        limit: int = 10,
    ) -> list[dict[str, Any]]:
        """Fetch observations for a FRED data series."""
        try:
            response = await self.client.get(
                f"{self.BASE_URL}/series/observations",
                params={
                    "series_id": series_id,
                    "api_key": self.api_key,
                    "file_type": "json",
                    "sort_order": "desc",
                    "limit": limit,
                },
            )
            data = response.json()
            return data.get("observations", [])
        except Exception as e:
            logger.error("fred_fetch_error", series=series_id, error=str(e))
            return []


class GenericAPIClient:
    """Generic REST API client for custom endpoints."""

    def __init__(self) -> None:
        self._client: httpx.AsyncClient | None = None

    async def start(self) -> None:
        self._client = httpx.AsyncClient(
            timeout=httpx.Timeout(30.0),
            headers={"User-Agent": settings.scrape_user_agent},
        )

    async def stop(self) -> None:
        if self._client:
            await self._client.aclose()

    @property
    def client(self) -> httpx.AsyncClient:
        if not self._client:
            raise RuntimeError("API client not started")
        return self._client

    async def fetch_endpoint(
        self,
        source: dict[str, Any],
    ) -> list[IngestedItem]:
        """
        Fetch data from a generic API endpoint.

        The source config should include:
        - url: API endpoint
        - headers: Optional auth headers
        - response_path: JSON path to articles array (e.g., "data.articles")
        - field_mapping: Mapping of API fields to IngestedItem fields
        """
        url = source["url"]
        headers = source.get("headers", {})
        response_path = source.get("responsePath", "data")
        field_mapping = source.get("fieldMapping", {})

        try:
            response = await self.client.get(url, headers=headers)
            response.raise_for_status()
            data = response.json()

            # Navigate to articles array
            for key in response_path.split("."):
                if isinstance(data, dict):
                    data = data.get(key, [])

            if not isinstance(data, list):
                data = [data]

            items = []
            for entry in data:
                title = entry.get(field_mapping.get("title", "title"), "")
                content = entry.get(field_mapping.get("content", "content"), "")
                entry_url = entry.get(field_mapping.get("url", "url"), url)

                if not title or not content:
                    continue

                content_hash = xxhash.xxh64(f"{entry_url}:{title}").hexdigest()

                items.append(IngestedItem(
                    source_id=source["id"],
                    source_name=source["name"],
                    source_type=SourceType.API,
                    credibility_tier=CredibilityTier(
                        source.get("credibilityTier", "TIER_3")
                    ),
                    url=entry_url,
                    title=title,
                    raw_content=content,
                    clean_content=content,
                    word_count=len(content.split()),
                    content_hash=content_hash,
                ))

            return items

        except Exception as e:
            logger.error("api_fetch_error", source=source.get("name"), error=str(e))
            return []


# Singleton instances
sec_client = SECEdgarClient()
fred_client = FREDClient()
api_client = GenericAPIClient()
