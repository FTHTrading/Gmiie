"""
Main Ingestion Pipeline
========================
Orchestrates the full ingestion pipeline:
1. Poll RSS feeds
2. Scrape web sources
3. Fetch API feeds
4. Crawl sitemaps for new URLs
5. Normalize content
6. Deduplicate
7. Store in database
8. Dispatch to AI processing queue

Can run as a scheduled daemon or triggered on-demand.
"""

from __future__ import annotations

import asyncio
import time
from datetime import datetime, timedelta
from typing import Any

from .api_feeds import api_client, sec_client
from .config import settings
from .database import db
from .dedup import dedup_engine
from .dispatcher import dispatcher
from .logger import logger, setup_logging
from .models import IngestedItem
from .normalizer import normalizer
from .rss import rss_poller
from .scraper import scraper
from .sitemap import sitemap_crawler
from .stablecoin_monitor import stablecoin_monitor


class IngestionPipeline:
    """Main orchestrator for the content ingestion pipeline."""

    async def startup(self) -> None:
        """Initialize all components."""
        setup_logging()
        logger.info("pipeline_starting", environment=settings.environment.value)

        await db.connect()
        await dispatcher.connect()
        await rss_poller.start()
        await scraper.start()
        await api_client.start()
        await sec_client.start()
        await sitemap_crawler.start()
        await stablecoin_monitor.start()

        logger.info("pipeline_ready")

    async def shutdown(self) -> None:
        """Gracefully shutdown all components."""
        logger.info("pipeline_shutting_down")

        await stablecoin_monitor.stop()
        await sitemap_crawler.stop()
        await sec_client.stop()
        await api_client.stop()
        await scraper.stop()
        await rss_poller.stop()
        await dispatcher.disconnect()
        await db.disconnect()

        logger.info("pipeline_stopped")

    async def run_rss_cycle(self) -> dict[str, Any]:
        """Run a single RSS polling cycle."""
        start = time.monotonic()
        logger.info("rss_cycle_start")

        sources = await db.get_active_sources(source_type="RSS")
        raw_items = await rss_poller.poll_all_feeds(sources)

        # Normalize
        normalized = normalizer.batch_normalize(raw_items)

        # Deduplicate
        unique, dupes = await dedup_engine.filter_duplicates(normalized)

        # Store and dispatch
        dispatched = 0
        for item in unique:
            try:
                article_id = await db.insert_raw_article(item)
                await dispatcher.dispatch(item)
                dispatched += 1
            except Exception as e:
                logger.error("store_dispatch_failed", title=item.title[:50], error=str(e))

        elapsed = int((time.monotonic() - start) * 1000)

        stats = {
            "cycle": "rss",
            "sources_polled": len(sources),
            "raw_items": len(raw_items),
            "unique": len(unique),
            "duplicates": len(dupes),
            "dispatched": dispatched,
            "duration_ms": elapsed,
        }

        await db.log_job("rss_poll", "COMPLETED", items_processed=dispatched, duration_ms=elapsed)
        logger.info("rss_cycle_complete", **stats)
        return stats

    async def run_scrape_cycle(self) -> dict[str, Any]:
        """Run a single web scraping cycle."""
        start = time.monotonic()
        logger.info("scrape_cycle_start")

        sources = await db.get_active_sources(source_type="SCRAPE")
        all_items: list[IngestedItem] = []

        for source in sources:
            # Discover URLs from sitemap if available
            sitemap_url = source.get("sitemapUrl")
            if sitemap_url:
                url_list = await sitemap_crawler.discover_urls(
                    sitemap_url,
                    max_urls=20,
                    since=datetime.utcnow() - timedelta(hours=settings.dedup_window_hours),
                )
                urls = [u["url"] for u in url_list]
            else:
                urls = source.get("scrapeUrls", [])

            if urls:
                items = await scraper.scrape_source(source, urls[:20])
                all_items.extend(items)

        # Normalize & dedup
        normalized = normalizer.batch_normalize(all_items)
        unique, dupes = await dedup_engine.filter_duplicates(normalized)

        dispatched = 0
        for item in unique:
            try:
                await db.insert_raw_article(item)
                await dispatcher.dispatch(item)
                dispatched += 1
            except Exception as e:
                logger.error("store_dispatch_failed", title=item.title[:50], error=str(e))

        elapsed = int((time.monotonic() - start) * 1000)

        stats = {
            "cycle": "scrape",
            "sources_scraped": len(sources),
            "urls_scraped": len(all_items),
            "unique": len(unique),
            "dispatched": dispatched,
            "duration_ms": elapsed,
        }

        await db.log_job("web_scrape", "COMPLETED", items_processed=dispatched, duration_ms=elapsed)
        logger.info("scrape_cycle_complete", **stats)
        return stats

    async def run_api_cycle(self) -> dict[str, Any]:
        """Run API feed polling cycle."""
        start = time.monotonic()
        logger.info("api_cycle_start")

        sources = await db.get_active_sources(source_type="API")
        all_items: list[IngestedItem] = []

        # SEC EDGAR
        try:
            sec_items = await sec_client.search_filings()
            all_items.extend(sec_items)
        except Exception as e:
            logger.error("sec_cycle_error", error=str(e))

        # Custom API sources
        for source in sources:
            try:
                items = await api_client.fetch_endpoint(source)
                all_items.extend(items)
            except Exception as e:
                logger.error("api_source_error", source=source.get("name"), error=str(e))

        normalized = normalizer.batch_normalize(all_items)
        unique, _ = await dedup_engine.filter_duplicates(normalized)

        dispatched = 0
        for item in unique:
            try:
                await db.insert_raw_article(item)
                await dispatcher.dispatch(item)
                dispatched += 1
            except Exception as e:
                logger.error("store_dispatch_failed", title=item.title[:50], error=str(e))

        elapsed = int((time.monotonic() - start) * 1000)

        stats = {
            "cycle": "api",
            "items_fetched": len(all_items),
            "unique": len(unique),
            "dispatched": dispatched,
            "duration_ms": elapsed,
        }

        await db.log_job("api_poll", "COMPLETED", items_processed=dispatched, duration_ms=elapsed)
        logger.info("api_cycle_complete", **stats)
        return stats

    async def run_stablecoin_cycle(self) -> dict[str, Any]:
        """Run the US state stablecoin & digital currency monitoring cycle."""
        start = time.monotonic()
        logger.info("stablecoin_cycle_start")

        signals = await stablecoin_monitor.run_cycle()
        dispatched = 0

        for signal in signals:
            try:
                item = signal.to_ingested_item()
                # Boost importance score for high-value signals
                if signal.raw_score >= 8.5:
                    item.metadata["importance_override"] = signal.raw_score
                    item.metadata["alert_severity"] = "high"
                elif signal.raw_score >= 7.0:
                    item.metadata["importance_override"] = signal.raw_score
                    item.metadata["alert_severity"] = "medium"

                await db.insert_raw_article(item)
                await dispatcher.dispatch(item)
                dispatched += 1
            except Exception as e:
                logger.error("stablecoin_dispatch_failed", title=signal.title[:50], error=str(e))

        elapsed = int((time.monotonic() - start) * 1000)
        stats = {
            "cycle": "stablecoin",
            "signals_detected": len(signals),
            "dispatched": dispatched,
            "duration_ms": elapsed,
            "top_states": list({
                code
                for sig in signals[:10]
                for code in sig.state_codes
            }),
        }

        await db.log_job("stablecoin_monitor", "COMPLETED", items_processed=dispatched, duration_ms=elapsed)
        logger.info("stablecoin_cycle_complete", **stats)
        return stats

    async def run_full_cycle(self) -> dict[str, Any]:
        """Run all ingestion cycles."""
        logger.info("full_cycle_start")
        start = time.monotonic()

        rss_stats = await self.run_rss_cycle()
        scrape_stats = await self.run_scrape_cycle()
        api_stats = await self.run_api_cycle()
        stablecoin_stats = await self.run_stablecoin_cycle()

        elapsed = int((time.monotonic() - start) * 1000)

        total = {
            "rss": rss_stats,
            "scrape": scrape_stats,
            "api": api_stats,
            "stablecoin": stablecoin_stats,
            "total_duration_ms": elapsed,
            "total_dispatched": (
                rss_stats["dispatched"]
                + scrape_stats["dispatched"]
                + api_stats["dispatched"]
                + stablecoin_stats["dispatched"]
            ),
        }

        logger.info("full_cycle_complete", total_dispatched=total["total_dispatched"], duration_ms=elapsed)
        return total

    async def run_daemon(self) -> None:
        """Run as a polling daemon with configurable intervals."""
        logger.info("daemon_starting")

        await self.startup()

        try:
            rss_last = 0.0
            scrape_last = 0.0
            api_last = 0.0
            stablecoin_last = 0.0

            while True:
                now = time.monotonic()

                # RSS poll
                if now - rss_last >= settings.rss_poll_interval:
                    try:
                        await self.run_rss_cycle()
                    except Exception as e:
                        logger.error("rss_cycle_error", error=str(e))
                    rss_last = time.monotonic()

                # Web scrape
                if now - scrape_last >= settings.scrape_interval:
                    try:
                        await self.run_scrape_cycle()
                    except Exception as e:
                        logger.error("scrape_cycle_error", error=str(e))
                    scrape_last = time.monotonic()

                # API poll
                if now - api_last >= settings.api_poll_interval:
                    try:
                        await self.run_api_cycle()
                    except Exception as e:
                        logger.error("api_cycle_error", error=str(e))
                    api_last = time.monotonic()

                # Stablecoin monitor — every 30 minutes
                if now - stablecoin_last >= 1800:
                    try:
                        await self.run_stablecoin_cycle()
                    except Exception as e:
                        logger.error("stablecoin_cycle_error", error=str(e))
                    stablecoin_last = time.monotonic()

                await asyncio.sleep(30)  # Check every 30 seconds

        except KeyboardInterrupt:
            logger.info("daemon_interrupted")
        finally:
            await self.shutdown()


pipeline = IngestionPipeline()


async def main() -> None:
    """Entry point for the ingestion service."""
    import argparse

    parser = argparse.ArgumentParser(description="XXXIII Ingestion Pipeline")
    parser.add_argument(
        "command",
        nargs="?",
        default="daemon",
        choices=["daemon", "once"],
        help="Run mode: 'daemon' (continuous polling) or 'once' (single cycle then exit)",
    )
    parser.add_argument(
        "--mode",
        default="full",
        choices=["full", "rss_only", "scrape_only", "api_only"],
        help="Which ingestion cycle to run (default: full)",
    )
    parser.add_argument(
        "--single-cycle",
        action="store_true",
        help="Alias for 'once' command — run one cycle then exit",
    )
    args = parser.parse_args()

    run_once = args.command == "once" or args.single_cycle

    if run_once:
        await pipeline.startup()
        try:
            if args.mode == "rss_only":
                stats = await pipeline.run_rss_cycle()
            elif args.mode == "scrape_only":
                stats = await pipeline.run_scrape_cycle()
            elif args.mode == "api_only":
                stats = await pipeline.run_api_cycle()
            else:
                stats = await pipeline.run_full_cycle()
            logger.info("one_shot_complete", stats=stats)
        finally:
            await pipeline.shutdown()
    else:
        await pipeline.run_daemon()


if __name__ == "__main__":
    asyncio.run(main())
