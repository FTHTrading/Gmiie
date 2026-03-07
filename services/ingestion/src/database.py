"""
Database operations for the ingestion service.
Uses psycopg (async PostgreSQL driver) for direct DB access.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

import psycopg
from psycopg.rows import dict_row

from .config import settings
from .logger import logger
from .models import IngestedItem, SourceConfig, SourceHealth


class Database:
    """PostgreSQL database client for ingestion operations."""

    def __init__(self) -> None:
        self._conn: psycopg.AsyncConnection | None = None

    async def connect(self) -> None:
        """Establish database connection."""
        self._conn = await psycopg.AsyncConnection.connect(
            settings.database_url,
            row_factory=dict_row,
        )
        logger.info("database_connected", url=settings.database_url[:30] + "...")

    async def disconnect(self) -> None:
        """Close database connection."""
        if self._conn:
            await self._conn.close()
            logger.info("database_disconnected")

    @property
    def conn(self) -> psycopg.AsyncConnection:
        if not self._conn:
            raise RuntimeError("Database not connected. Call connect() first.")
        return self._conn

    # ── Sources ────────────────────────────────────────────────

    async def get_active_sources(self, source_type: str | None = None) -> list[dict[str, Any]]:
        """Fetch all active sources, optionally filtered by type."""
        query = 'SELECT * FROM "Source" WHERE enabled = true'
        params: list[Any] = []
        if source_type:
            query += ' AND "sourceType" = $1'
            params.append(source_type)
        query += ' ORDER BY "credibilityTier", name'

        async with self.conn.cursor() as cur:
            await cur.execute(query, params)
            rows = await cur.fetchall()
            return [dict(r) for r in rows]

    async def update_source_health(
        self,
        source_id: str,
        success: bool,
        items_count: int = 0,
        error: str | None = None,
    ) -> None:
        """Update source polling health metrics."""
        now = datetime.utcnow()
        if success:
            query = """
                UPDATE "Source" SET
                    "lastPolledAt" = $1,
                    "lastSuccessAt" = $1,
                    "consecutiveFailures" = 0,
                    "totalItemsIngested" = "totalItemsIngested" + $2
                WHERE id = $3
            """
            params = [now, items_count, source_id]
        else:
            query = """
                UPDATE "Source" SET
                    "lastPolledAt" = $1,
                    "consecutiveFailures" = "consecutiveFailures" + 1,
                    "lastError" = $2
                WHERE id = $3
            """
            params = [now, error, source_id]

        async with self.conn.cursor() as cur:
            await cur.execute(query, params)
        await self.conn.commit()

    # ── Articles ───────────────────────────────────────────────

    async def check_url_exists(self, url: str) -> bool:
        """Check if a URL already exists in the articles table."""
        query = 'SELECT EXISTS(SELECT 1 FROM "Article" WHERE "sourceUrl" = $1)'
        async with self.conn.cursor() as cur:
            await cur.execute(query, [url])
            row = await cur.fetchone()
            return bool(row and row.get("exists", False))

    async def check_hash_exists(self, content_hash: str) -> bool:
        """Check if a content hash already exists."""
        query = 'SELECT EXISTS(SELECT 1 FROM "Article" WHERE "contentHash" = $1)'
        async with self.conn.cursor() as cur:
            await cur.execute(query, [content_hash])
            row = await cur.fetchone()
            return bool(row and row.get("exists", False))

    async def insert_raw_article(self, item: IngestedItem) -> str:
        """Insert a raw ingested article and return its ID."""
        query = """
            INSERT INTO "Article" (
                "sourceUrl", "rawTitle", "rawContent", "cleanContent",
                "contentHash", "wordCount", "language",
                "authorName", "publishedAt", "discoveredAt",
                "metaTitle", "metaDescription", "ogImage", "canonicalUrl",
                "sourceId", "status", "credibilityTier"
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                $11, $12, $13, $14, $15, 'INGESTED', $16
            )
            RETURNING id
        """
        params = [
            str(item.url),
            item.title,
            item.raw_content,
            item.clean_content,
            item.content_hash,
            item.word_count,
            item.language,
            item.author,
            item.published_at,
            item.discovered_at,
            item.meta_title,
            item.meta_description,
            item.og_image,
            item.canonical_url,
            item.source_id,
            item.credibility_tier.value,
        ]

        async with self.conn.cursor() as cur:
            await cur.execute(query, params)
            row = await cur.fetchone()
            await self.conn.commit()
            if row:
                return str(row["id"])
            raise RuntimeError("Failed to insert article")

    # ── Job Logging ────────────────────────────────────────────

    async def log_job(
        self,
        job_type: str,
        status: str,
        source_id: str | None = None,
        items_processed: int = 0,
        duration_ms: int = 0,
        error: str | None = None,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        """Log a job execution to the JobLog table."""
        query = """
            INSERT INTO "JobLog" (
                "jobType", status, "sourceId",
                "itemsProcessed", "durationMs", error, metadata
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        """
        import orjson

        params = [
            job_type,
            status,
            source_id,
            items_processed,
            duration_ms,
            error,
            orjson.dumps(metadata or {}).decode() if metadata else "{}",
        ]

        async with self.conn.cursor() as cur:
            await cur.execute(query, params)
        await self.conn.commit()


db = Database()
