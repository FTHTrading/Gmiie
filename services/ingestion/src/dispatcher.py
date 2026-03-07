"""
Job Dispatcher
===============
Dispatches processed items to the Redis-backed job queue
for downstream AI processing (classification, drafting, scoring).
"""

from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

import orjson
import redis.asyncio as redis

from .config import settings
from .logger import logger
from .models import DispatchPayload, IngestedItem


class Dispatcher:
    """Dispatches ingested items to the processing queue."""

    QUEUE_KEY = "xxxiii:jobs:classify"
    PRIORITY_QUEUE_KEY = "xxxiii:jobs:priority"
    STATS_KEY = "xxxiii:ingestion:stats"

    def __init__(self) -> None:
        self._redis: redis.Redis | None = None

    async def connect(self) -> None:
        """Connect to Redis."""
        self._redis = redis.from_url(
            settings.redis_url,
            decode_responses=False,
        )
        await self._redis.ping()
        logger.info("dispatcher_connected", redis_url=settings.redis_url[:20] + "...")

    async def disconnect(self) -> None:
        """Disconnect from Redis."""
        if self._redis:
            await self._redis.aclose()
            logger.info("dispatcher_disconnected")

    @property
    def r(self) -> redis.Redis:
        if not self._redis:
            raise RuntimeError("Dispatcher not connected. Call connect() first.")
        return self._redis

    async def dispatch(self, item: IngestedItem, priority: int = 5) -> str:
        """
        Dispatch a single item to the processing queue.

        Priority levels:
        1-3: High priority (TIER_1 sources, breaking news)
        4-6: Normal priority (standard articles)
        7-9: Low priority (TIER_4 sources, older content)
        10: Background (sitemap fills, backfill operations)
        """
        job_id = f"job_{uuid.uuid4().hex[:12]}_{int(datetime.utcnow().timestamp())}"

        payload = DispatchPayload(
            job_id=job_id,
            job_type="classify_and_draft",
            item=item,
            priority=priority,
            created_at=datetime.utcnow(),
        )

        # Determine priority based on credibility tier
        tier_priority = {
            "TIER_1": 2,
            "TIER_2": 4,
            "TIER_3": 6,
            "TIER_4": 8,
        }
        effective_priority = min(
            priority,
            tier_priority.get(item.credibility_tier.value, 5),
        )

        serialized = orjson.dumps(payload.model_dump(), default=str)

        # Use sorted set for priority queue (lower score = higher priority)
        await self.r.zadd(
            self.QUEUE_KEY,
            {serialized: effective_priority},
        )

        # Update stats
        await self.r.hincrby(self.STATS_KEY, "total_dispatched", 1)
        await self.r.hincrby(self.STATS_KEY, f"dispatched_{item.source_type.value}", 1)
        await self.r.hset(self.STATS_KEY, "last_dispatch_at", datetime.utcnow().isoformat())

        logger.info(
            "job_dispatched",
            job_id=job_id,
            title=item.title[:60],
            priority=effective_priority,
            source=item.source_name,
        )

        return job_id

    async def dispatch_batch(
        self,
        items: list[IngestedItem],
        priority: int = 5,
    ) -> list[str]:
        """Dispatch a batch of items to the queue."""
        job_ids = []
        for item in items:
            job_id = await self.dispatch(item, priority)
            job_ids.append(job_id)

        logger.info("batch_dispatched", count=len(job_ids))
        return job_ids

    async def get_queue_depth(self) -> int:
        """Get the current queue depth."""
        return await self.r.zcard(self.QUEUE_KEY)

    async def get_stats(self) -> dict[str, Any]:
        """Get ingestion statistics."""
        raw = await self.r.hgetall(self.STATS_KEY)
        return {
            k.decode() if isinstance(k, bytes) else k:
            v.decode() if isinstance(v, bytes) else v
            for k, v in raw.items()
        }


dispatcher = Dispatcher()
