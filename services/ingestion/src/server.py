"""
Ingestion HTTP Server
======================
FastAPI wrapper around the ingestion pipeline.
Exposes HTTP endpoints for the BullMQ queue service to trigger
ingestion cycles and receive back the ingested items.

Start with:
  uvicorn src.server:app --host 0.0.0.0 --port 8100

Or via the project entry point:
  python -m src.server
"""

from __future__ import annotations

import asyncio
import time
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

from .config import settings
from .database import db
from .logger import logger, setup_logging
from .pipeline import pipeline


# ── Lifespan ──────────────────────────────────────────────────


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown lifecycle for the FastAPI app."""
    setup_logging()
    logger.info("http_server_starting", port=8100)
    await pipeline.startup()
    yield
    await pipeline.shutdown()
    logger.info("http_server_stopped")


app = FastAPI(
    title="XXXIII Ingestion Service",
    version="0.1.0",
    description="Content ingestion API for the XXXIII intelligence pipeline",
    lifespan=lifespan,
)


# ── Response Models ───────────────────────────────────────────


class IngestedArticle(BaseModel):
    id: str
    title: str
    content: str
    source: str
    credibility: str


class CycleResponse(BaseModel):
    cycle: str
    items: list[IngestedArticle]
    stats: dict[str, Any]
    duration_ms: int


class HealthResponse(BaseModel):
    status: str
    uptime_seconds: float
    database: bool
    redis: bool


# ── State ─────────────────────────────────────────────────────

_start_time = time.monotonic()


# ── Helper: Fetch recently ingested articles ──────────────────


async def get_recently_ingested(since: datetime) -> list[dict[str, Any]]:
    """Query articles ingested since the given timestamp."""
    query = """
        SELECT a.id, a."rawTitle" as title,
               COALESCE(a."cleanContent", a."rawContent", '') as content,
               COALESCE(s.name, 'unknown') as source,
               COALESCE(a."credibilityTier", 'TIER_3') as credibility
        FROM "Article" a
        LEFT JOIN "Source" s ON a."sourceId" = s.id
        WHERE a."discoveredAt" >= $1
          AND a.status = 'INGESTED'
        ORDER BY a."discoveredAt" DESC
    """
    async with db.conn.cursor() as cur:
        await cur.execute(query, [since])
        rows = await cur.fetchall()
        return [dict(r) for r in rows]


# ── Routes ────────────────────────────────────────────────────


@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint."""
    db_ok = False
    redis_ok = False

    try:
        async with db.conn.cursor() as cur:
            await cur.execute("SELECT 1")
        db_ok = True
    except Exception:
        pass

    try:
        from .dispatcher import dispatcher
        if dispatcher._redis:
            await dispatcher._redis.ping()
            redis_ok = True
    except Exception:
        pass

    return HealthResponse(
        status="ok" if db_ok else "degraded",
        uptime_seconds=round(time.monotonic() - _start_time, 1),
        database=db_ok,
        redis=redis_ok,
    )


@app.post("/api/poll", response_model=CycleResponse)
async def poll_rss_all():
    """Poll all active RSS sources."""
    before = datetime.utcnow()
    start = time.monotonic()

    try:
        stats = await pipeline.run_rss_cycle()
    except Exception as e:
        logger.error("http_rss_poll_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

    elapsed = int((time.monotonic() - start) * 1000)
    articles = await get_recently_ingested(before)

    return CycleResponse(
        cycle="rss",
        items=[IngestedArticle(**a) for a in articles],
        stats=stats,
        duration_ms=elapsed,
    )


@app.post("/api/poll/{source_id}", response_model=CycleResponse)
async def poll_rss_source(source_id: str):
    """Poll a specific RSS source by ID."""
    before = datetime.utcnow()
    start = time.monotonic()

    try:
        # Get the specific source
        sources = await db.get_active_sources(source_type="RSS")
        source = next((s for s in sources if s["id"] == source_id), None)
        if not source:
            raise HTTPException(status_code=404, detail=f"Source {source_id} not found")

        from .rss import rss_poller
        from .normalizer import normalizer
        from .dedup import dedup_engine
        from .dispatcher import dispatcher

        raw_items = await rss_poller.poll_feed(source)
        normalized = normalizer.batch_normalize(raw_items)
        unique, _ = await dedup_engine.filter_duplicates(normalized)

        for item in unique:
            try:
                await db.insert_raw_article(item)
                await dispatcher.dispatch(item)
            except Exception as e:
                logger.error("store_failed", error=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error("http_rss_poll_source_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

    elapsed = int((time.monotonic() - start) * 1000)
    articles = await get_recently_ingested(before)

    return CycleResponse(
        cycle="rss",
        items=[IngestedArticle(**a) for a in articles],
        stats={"source_id": source_id, "items": len(articles)},
        duration_ms=elapsed,
    )


@app.post("/api/scrape", response_model=CycleResponse)
async def scrape_sources():
    """Run a web scraping cycle across all SCRAPE sources."""
    before = datetime.utcnow()
    start = time.monotonic()

    try:
        stats = await pipeline.run_scrape_cycle()
    except Exception as e:
        logger.error("http_scrape_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

    elapsed = int((time.monotonic() - start) * 1000)
    articles = await get_recently_ingested(before)

    return CycleResponse(
        cycle="scrape",
        items=[IngestedArticle(**a) for a in articles],
        stats=stats,
        duration_ms=elapsed,
    )


@app.post("/api/fetch", response_model=CycleResponse)
async def fetch_apis_all():
    """Fetch from all API sources (SEC EDGAR, etc.)."""
    before = datetime.utcnow()
    start = time.monotonic()

    try:
        stats = await pipeline.run_api_cycle()
    except Exception as e:
        logger.error("http_api_fetch_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

    elapsed = int((time.monotonic() - start) * 1000)
    articles = await get_recently_ingested(before)

    return CycleResponse(
        cycle="api",
        items=[IngestedArticle(**a) for a in articles],
        stats=stats,
        duration_ms=elapsed,
    )


@app.post("/api/fetch/{source_id}", response_model=CycleResponse)
async def fetch_api_source(source_id: str):
    """Fetch from a specific API source."""
    before = datetime.utcnow()
    start = time.monotonic()

    try:
        sources = await db.get_active_sources(source_type="API")
        source = next((s for s in sources if s["id"] == source_id), None)
        if not source:
            raise HTTPException(status_code=404, detail=f"API source {source_id} not found")

        from .api_feeds import api_client
        from .normalizer import normalizer
        from .dedup import dedup_engine
        from .dispatcher import dispatcher

        items = await api_client.fetch_endpoint(source)
        normalized = normalizer.batch_normalize(items)
        unique, _ = await dedup_engine.filter_duplicates(normalized)

        for item in unique:
            try:
                await db.insert_raw_article(item)
                await dispatcher.dispatch(item)
            except Exception as e:
                logger.error("store_failed", error=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error("http_api_fetch_source_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

    elapsed = int((time.monotonic() - start) * 1000)
    articles = await get_recently_ingested(before)

    return CycleResponse(
        cycle="api",
        items=[IngestedArticle(**a) for a in articles],
        stats={"source_id": source_id, "items": len(articles)},
        duration_ms=elapsed,
    )


@app.post("/api/sitemap", response_model=CycleResponse)
async def crawl_sitemap():
    """Crawl a sitemap URL for new article URLs."""
    before = datetime.utcnow()
    start = time.monotonic()

    # The sitemap crawl discovers URLs, doesn't ingest content directly
    # This returns discovered URLs which can be scraped in the next cycle
    try:
        from .sitemap import sitemap_crawler

        sources = await db.get_active_sources(source_type="SCRAPE")
        all_urls: list[dict[str, Any]] = []

        for source in sources:
            sitemap_url = source.get("sitemapUrl")
            if sitemap_url:
                urls = await sitemap_crawler.discover_urls(sitemap_url, max_urls=50)
                all_urls.extend(urls)
    except Exception as e:
        logger.error("http_sitemap_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

    elapsed = int((time.monotonic() - start) * 1000)

    return CycleResponse(
        cycle="sitemap",
        items=[],  # Sitemap doesn't produce articles directly
        stats={"urls_discovered": len(all_urls), "urls": all_urls[:100]},
        duration_ms=elapsed,
    )


@app.post("/api/full-cycle", response_model=CycleResponse)
async def run_full_cycle():
    """Run all ingestion cycles (RSS + scrape + API)."""
    before = datetime.utcnow()
    start = time.monotonic()

    try:
        stats = await pipeline.run_full_cycle()
    except Exception as e:
        logger.error("http_full_cycle_error", error=str(e))
        raise HTTPException(status_code=500, detail=str(e))

    elapsed = int((time.monotonic() - start) * 1000)
    articles = await get_recently_ingested(before)

    return CycleResponse(
        cycle="full",
        items=[IngestedArticle(**a) for a in articles],
        stats=stats,
        duration_ms=elapsed,
    )


@app.get("/api/stats")
async def get_stats():
    """Get ingestion pipeline statistics."""
    try:
        from .dispatcher import dispatcher
        queue_depth = await dispatcher.get_queue_depth()
        redis_stats = await dispatcher.get_stats()
    except Exception:
        queue_depth = -1
        redis_stats = {}

    # Article counts by status
    query = """
        SELECT status, COUNT(*) as count
        FROM "Article"
        GROUP BY status
        ORDER BY count DESC
    """
    article_stats = {}
    try:
        async with db.conn.cursor() as cur:
            await cur.execute(query)
            rows = await cur.fetchall()
            article_stats = {r["status"]: r["count"] for r in rows}
    except Exception:
        pass

    # Source counts
    source_query = """
        SELECT "sourceType", COUNT(*) as count
        FROM "Source"
        WHERE enabled = true
        GROUP BY "sourceType"
    """
    source_stats = {}
    try:
        async with db.conn.cursor() as cur:
            await cur.execute(source_query)
            rows = await cur.fetchall()
            source_stats = {r["sourceType"]: r["count"] for r in rows}
    except Exception:
        pass

    return {
        "queue_depth": queue_depth,
        "dispatcher": redis_stats,
        "articles": article_stats,
        "sources": source_stats,
    }


# ── Entry point ───────────────────────────────────────────────


def main():
    """Run the HTTP server."""
    import uvicorn

    uvicorn.run(
        "src.server:app",
        host="0.0.0.0",
        port=8100,
        reload=settings.environment.value == "development",
        log_level=settings.log_level.lower(),
    )


if __name__ == "__main__":
    main()
