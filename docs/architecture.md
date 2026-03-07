# XXXIII.IO — Technical Architecture

## System Overview

XXXIII.IO is a multi-product platform built as a Turborepo monorepo. The system consists of four Next.js applications, five shared packages, and four backend services that together form an AI-powered intelligence pipeline for capital markets and digital asset regulation.

---

## High-Level Architecture

```
                    ┌─────────────────────────────────────────┐
                    │              DNS / CDN Layer             │
                    │  xxxiii.io  gmiie.  lps.  studio.  api. │
                    └─────────────────┬───────────────────────┘
                                      │
                    ┌─────────────────┴───────────────────────┐
                    │           Next.js App Layer              │
                    │  ┌─────┐ ┌──────┐ ┌─────┐ ┌──────┐    │
                    │  │ web │ │gmiie │ │ lps │ │studio│    │
                    │  └──┬──┘ └──┬───┘ └──┬──┘ └──┬───┘    │
                    │     └───────┴────────┴───────┘         │
                    │              Shared Packages             │
                    │   db  │  types  │  config  │  seo  │ ui │
                    └─────────────────┬───────────────────────┘
                                      │
                    ┌─────────────────┴───────────────────────┐
                    │           Service Layer                   │
                    │  ┌──────────┐  ┌────────┐  ┌─────────┐ │
                    │  │Ingestion │  │Queue   │  │Publisher│ │
                    │  │(Python)  │  │(BullMQ)│  │         │ │
                    │  └────┬─────┘  └───┬────┘  └────┬────┘ │
                    │       └────────────┤            │       │
                    │              ┌─────┴──────┐     │       │
                    │              │  AI Engine  │─────┘       │
                    │              │ (GPT-4o)   │             │
                    │              └────────────┘             │
                    └─────────────────┬───────────────────────┘
                                      │
                    ┌─────────────────┴───────────────────────┐
                    │         Infrastructure Layer             │
                    │  PostgreSQL │ Redis │ Meilisearch │ S3  │
                    └─────────────────────────────────────────┘
```

---

## Data Pipeline Architecture

### Ingestion Flow

```
Sources (20+)
    │
    ├─ RSS Feeds ──── feedparser ──┐
    ├─ Web Pages ──── Playwright ──┤
    ├─ SEC EDGAR ──── httpx ───────┤
    ├─ FRED API ───── httpx ───────┤
    └─ Sitemaps ───── XML parser ──┘
                                    │
                        ┌───────────┴──────────┐
                        │   Deduplication       │
                        │   • URL normalization │
                        │   • Content hash      │
                        │   • Title similarity  │
                        └───────────┬──────────┘
                                    │
                        ┌───────────┴──────────┐
                        │   Redis Dispatch      │
                        │   Priority queue      │
                        │   (tier-based)        │
                        └───────────┬──────────┘
                                    │
                                    ▼
                            BullMQ Queues
```

### Processing Pipeline

```
BullMQ Job Queues (11 queues)
    │
    ├─ ingestion  ─── Trigger Python service
    ├─ classify   ─── AI topic/entity/type classification
    ├─ score      ─── 9-dimension signal scoring
    ├─ draft      ─── AI article generation (brief/analysis/deep-dive)
    ├─ seo        ─── Title/meta/FAQ optimization
    ├─ review     ─── Human review queue
    ├─ publish    ─── Validation + status transition
    ├─ entity     ─── Entity profile building/refresh
    ├─ newsletter ─── Daily/weekly compilation
    ├─ sitemap    ─── XML sitemap regeneration
    └─ maintenance── Cleanup, stats, health checks
```

---

## Database Design

### Core Models

```
Source (1) ──── (M) Article (M) ──── (M) Topic
                       │                    │
                       │              TopicCluster
                       │
                (M) ── ┴ ── (M)
                   Entity
                       │
               TimelineEvent
```

### Key Design Decisions

1. **Credibility Tiers** — Sources rated TIER_1 through TIER_4 for weighted scoring
2. **Article Status Machine** — 10-state machine (RAW → PUBLISHED) with defined transitions
3. **Signal Scores** — 9 dimensions stored as JSON, overall score as indexed float
4. **Content Hashing** — xxhash for fast deduplication at ingestion
5. **Soft Deletes** — Articles are archived, never hard-deleted

---

## AI Engine Architecture

### Model Selection

| Task | Model | Temperature | Rationale |
|------|-------|------------|-----------|
| Classification | GPT-4o | 0.1 | High precision, structured output |
| Signal Scoring | GPT-4o | 0.2 | Consistent numerical scoring |
| Brief Writing | GPT-4o | 0.4 | Balanced creativity/accuracy |
| Deep Analysis | GPT-4o | 0.5 | More creative freedom |
| SEO Titles | GPT-4o-mini | 0.4 | Cost-effective, pattern-based |
| Meta Descriptions | GPT-4o-mini | 0.3 | Cost-effective |
| FAQ Generation | GPT-4o | 0.3 | Structured data accuracy |

### Prompt Architecture

12 prompt templates organized by category:
- **Analysis**: classify_article, score_signal
- **Generation**: write_brief, write_analysis, write_deep_dive, summarize
- **SEO**: generate_seo_title, generate_meta_description, generate_faqs
- **Profile**: build_entity_profile
- **Digest**: compile_newsletter, write_daily_digest

All prompts use structured JSON output schemas for deterministic parsing.

---

## Security Model

### Authentication
- **Studio**: NextAuth.js with role-based access (ADMIN, EDITOR, ANALYST, VIEWER)
- **Public Apps**: No authentication required
- **Services**: Internal network, no public exposure

### Content Security
- HTML sanitization via sanitize-html (allowlisted tags)
- External links get `rel="noopener noreferrer nofollow"`
- All user inputs validated with Zod schemas
- SQL injection prevented by Prisma parameterized queries

---

## Deployment Architecture

### Production Target

| Component | Platform | Scaling |
|-----------|----------|---------|
| Next.js Apps | Vercel | Edge + serverless |
| PostgreSQL | Managed (Neon/Supabase) | Single writer + read replicas |
| Redis | Managed (Upstash) | Serverless |
| Meilisearch | Meilisearch Cloud | Managed |
| Queue Workers | Railway/Fly.io | Horizontal (per queue) |
| Ingestion | Railway/Fly.io | Single instance + cron |
| S3 Storage | AWS S3 / Cloudflare R2 | Unlimited |

### Environment Separation

- **Development**: Docker Compose (local PostgreSQL, Redis, Meilisearch, MinIO)
- **Staging**: Vercel preview deployments + shared staging infra
- **Production**: Vercel production + managed services

---

## Performance Considerations

1. **ISR (Incremental Static Regeneration)** — Article pages revalidate every 60s
2. **Edge Caching** — Static assets and generated pages cached at CDN edge
3. **Database Indexing** — Compound indexes on status+publishedAt, topic+score, entity lookups
4. **Queue Concurrency** — Per-queue concurrency limits (classify: 5, draft: 3, publish: 1)
5. **Rate Limiting** — Ingestion service respects per-source rate limits
6. **Content Deduplication** — Three-layer dedup prevents redundant processing
