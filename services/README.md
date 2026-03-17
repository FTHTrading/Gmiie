# Services

This directory contains the backend processing services that power the XXXIII.IO intelligence pipeline.

## Services

| Service | Runtime | Purpose |
|---------|---------|---------|
| [ingestion/](ingestion/) | Python 3.12 | Content intake from RSS feeds, web scraping, and API polling |
| [ai-engine/](ai-engine/) | Node.js | GPT-4o prompt orchestration — classification, scoring, drafting, SEO, entity extraction |
| [queue/](queue/) | Node.js | BullMQ workers managing 11 processing queues via Redis |

## Pipeline Flow

```
Sources → ingestion → [queue: classify → score → draft → seo → entity → publish] → Database
```

## Running

```bash
# Python ingestion service
cd services/ingestion
python -m venv venv
source venv/bin/activate   # venv\Scripts\activate on Windows
pip install -r requirements.txt
python main.py

# AI engine
cd services/ai-engine
pnpm dev

# Queue workers
cd services/queue
pnpm dev
```

## Environment Requirements

| Variable | Service | Purpose |
|----------|---------|---------|
| `OPENAI_API_KEY` | ai-engine | GPT-4o API access |
| `REDIS_URL` | queue | BullMQ connection |
| `DATABASE_URL` | ai-engine, queue | PostgreSQL via Prisma |

## Architecture

Services communicate via BullMQ (Redis) queues. No direct HTTP calls between services. See [System Overview](../docs/architecture/system-overview.md) for the full architecture diagram.
