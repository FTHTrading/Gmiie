# XXXIII.IO

**The intelligence infrastructure for the tokenized capital markets era.**

XXXIII.IO is a modular platform that ingests, analyzes, and publishes
global intelligence on tokenized securities, digital asset regulation,
and financial market infrastructure.

The platform powers three integrated systems:

- **GMIIE** — Global Monetary Infrastructure Intelligence Engine
- **LPS-1** — Deterministic publishing protocol for verifiable digital provenance
- **XXXIII Studio** — AI editorial and intelligence operations platform

Together they form an automated knowledge infrastructure for the
emerging on-chain financial system.

---

## Ecosystem Overview

```
Global Sources
(Regulators, Banks, Media, Protocols)
        │
        ▼
Ingestion Pipeline
(RSS, APIs, Scraping)
        │
        ▼
AI Intelligence Engine
(Classification, Scoring, Analysis)
        │
        ▼
Publisher Service
(Validation → SEO → Publication)
        │
        ▼
GMIIE Platform
(Intelligence Feed, Topics, Entities, Signals)
        │
        ├── Research Reports
        ├── Weekly Intelligence Brief
        └── Market Infrastructure Analysis
```

---

## Intelligence Model

XXXIII.IO transforms raw financial news into structured intelligence.

Each development is processed through the GMIIE pipeline and converted
into a standardized intelligence artifact containing:

- Structured entities (regulators, banks, exchanges, protocols)
- Topic classification across 20 categories and 8 clusters
- Infrastructure impact analysis
- Regulatory implications
- Market significance scoring (9 dimensions, 1–10 scale)
- AI-generated analysis (briefs, deep dives, weekly digests)
- Machine-readable metadata (JSON-LD, Open Graph, sitemaps)

---

## Core Intelligence Topics

GMIIE focuses on the infrastructure transformation of global finance.

Primary coverage areas include:

- Tokenized securities and real-world assets
- Digital asset regulation and compliance
- Stablecoins and payment rails
- Central bank digital currency (CBDC) development
- Custody and digital asset infrastructure
- Market settlement modernization
- Institutional blockchain adoption
- Cross-border financial infrastructure
- Sovereign digital financial systems

---

## Architecture

```
xxxiii-io/
├── apps/
│   ├── hub/          → xxxiii.io         (Ecosystem landing hub)
│   ├── gmiie/        → gmiie.xxxiii.io   (Intelligence platform)
│   ├── lps/          → lps.xxxiii.io     (LPS-1 protocol standard)
│   └── studio/       → studio.xxxiii.io  (Admin dashboard)
├── packages/
│   ├── db/           → Prisma ORM + PostgreSQL schema
│   ├── types/        → Shared TypeScript types
│   ├── config/       → Brand, domains, taxonomy, navigation
│   ├── seo/          → Metadata, JSON-LD, sitemaps
│   └── ui/           → Design system components
├── services/
│   ├── ingestion/    → Python async pipeline (RSS, scraping, APIs)
│   ├── ai-engine/    → OpenAI/Anthropic classification, scoring, writing
│   │   └── prompts/  → Modular prompt templates (classify, score, write, seo, digest)
│   ├── queue/        → BullMQ job orchestration
│   └── publisher/    → Content validation & publication workflow
├── data/
│   ├── sources/      → Structured source registries by category
│   ├── taxonomy/     → Topic clusters & classification trees
│   ├── entity-seeds/ → Seed data for known entities
│   └── topic-clusters/ → SEO topic cluster maps
└── infra/
    ├── docker/       → Docker Compose + Dockerfiles
    ├── dns/          → DNS record configuration
    └── scripts/      → Setup & deployment scripts
```

## Products

### GMIIE — Global Monetary Infrastructure Intelligence Engine
AI-powered intelligence platform covering tokenized securities, CBDC development, stablecoin regulation, digital asset compliance, and institutional DeFi. Ingests from 20+ tier-1 sources including the Federal Reserve, SEC, BIS, IMF, and ECB.

### LPS-1 — Literary Publishing Standard
Protocol specification for on-chain literary asset verification. Defines the 5-layer stack (L0 Content Hash → L4 Marketplace) for tokenized literary works.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS |
| **Backend** | Node.js, TypeScript, Prisma ORM |
| **Database** | PostgreSQL 16, Redis 7 |
| **Search** | Meilisearch |
| **AI** | OpenAI GPT-4o, Anthropic Claude |
| **Queue** | BullMQ |
| **Ingestion** | Python 3.12, Playwright, feedparser |
| **Storage** | S3 (MinIO for dev) |
| **Monorepo** | Turborepo, pnpm workspaces |

---

## Quick Start

### Prerequisites
- Node.js 20+
- pnpm 9+
- Docker & Docker Compose
- Python 3.12+ (for ingestion service)

### Setup

```bash
# Clone the repository
git clone https://github.com/xxxiii/xxxiii-io.git
cd xxxiii-io

# Run the setup script
chmod +x infra/scripts/setup.sh
./infra/scripts/setup.sh

# Or manually:
pnpm install
cp .env.example .env     # Edit with your API keys
docker compose -f infra/docker/docker-compose.yml up -d postgres redis meilisearch
pnpm --filter @xxxiii/db exec prisma generate
pnpm --filter @xxxiii/db exec prisma db push
pnpm run build --filter='./packages/*'
```

### Development

```bash
# Start all apps
pnpm dev

# Start individual apps
pnpm dev:hub       # localhost:3000  — xxxiii.io
pnpm dev:gmiie     # localhost:3001  — gmiie.xxxiii.io
pnpm dev:lps       # localhost:3002  — lps.xxxiii.io
pnpm dev:studio    # localhost:3003  — studio.xxxiii.io

# Start queue workers
pnpm --filter @xxxiii/queue dev

# Start ingestion service
cd services/ingestion && python -m src.pipeline
```

### Infrastructure

```bash
# Start all infra services
docker compose -f infra/docker/docker-compose.yml up -d

# Access points
# PostgreSQL  → localhost:5432
# Redis       → localhost:6379
# Meilisearch → localhost:7700
# Adminer     → localhost:8080  (DB admin UI)
# MinIO       → localhost:9001  (S3 console)
```

---

## Intelligence Pipeline

The core data flow from source to publication:

```
Source → Ingest → Deduplicate → Classify → Score → Draft → SEO → Review → Publish
         (Python)                (AI)       (AI)    (AI)    (AI)
```

1. **Ingestion** — Python service polls RSS feeds, scrapes web pages, and fetches API data from 20+ sources
2. **Deduplication** — URL normalization, content hashing (xxhash), title similarity matching
3. **Classification** — AI determines topic, entities, article type, and urgency
4. **Scoring** — 9-dimension signal scoring (regulatory impact, market significance, institutional relevance, etc.)
5. **Drafting** — AI generates briefs, analyses, or deep dives based on signal scores
6. **SEO + GEO Optimization** — Title optimization, meta descriptions, FAQ schema, AI knowledge system optimization
7. **Review** — Human review queue for quality assurance
8. **Publishing** — Content validation, sanitization, slug generation, status transitions

---

## Signal Scoring Dimensions

Each article is scored 1–10 across 9 intelligence dimensions:

| Dimension | Weight (Tier 1) | Description |
|-----------|----------------|-------------|
| Regulatory Impact | 20% | Policy and compliance implications |
| Market Significance | 15% | Price and volume effects |
| Institutional Relevance | 15% | Importance to institutional actors |
| Infrastructure Development | 10% | Technical infrastructure changes |
| Narrative Influence | 10% | Market sentiment and discourse |
| Geopolitical Relevance | 10% | Cross-border and sovereignty impact |
| Innovation Signal | 8% | Novel technology or approaches |
| Risk Factor | 7% | Systemic or operational risk |
| Temporal Urgency | 5% | Time-sensitivity of information |

---

## Source Tiers

| Tier | Sources | Credibility |
|------|---------|------------|
| **Tier 1** | Federal Reserve, SEC, BIS, IMF, CFTC, ECB | Authoritative — official government/regulatory |
| **Tier 2** | CoinDesk, The Block, Bloomberg Law, FT, Chainalysis | Verified — established institutional media |
| **Tier 3** | Ledger Insights, DL News, Cointelegraph, Blockworks | Contextual — industry-specific coverage |
| **Tier 4** | Community, independent analysts | Supplementary — additional perspectives |

---

## Database Schema

15+ models managed by Prisma ORM:

- **Source** — Feed configurations with credibility tiers
- **Article** — Full content with classification, scores, SEO metadata
- **Topic / TopicCluster** — Hierarchical taxonomy (20 topics → 8 clusters)
- **Entity** — Organizations, regulators, protocols, people
- **Signal** — Raw signal events from various sources
- **Tag** — Content tagging system
- **User / AuditLog** — Admin authentication and activity tracking
- **JobLog** — Pipeline job execution history
- **TimelineEvent** — Entity timeline tracking

---

## Deployment Architecture

Production environments are deployed as independent services:

| Service | Infrastructure |
|---------|----------------|
| Web apps | Vercel / Netlify |
| Workers | Docker containers |
| Database | Managed PostgreSQL |
| Queue | Redis cluster |
| Search | Meilisearch |
| Storage | S3 compatible |

All services are horizontally scalable and containerized.

---

## Security

XXXIII.IO follows several security practices:

- Role-based admin authentication
- Signed ingestion sources with credibility tiers
- HTML sanitization before publishing
- Immutable article history
- Audit logging for editorial actions
- Environment variable secret isolation
- Queue job isolation
- Content hash verification for deduplication

Sensitive credentials are never committed to the repository.

---

## Environment Variables

Copy `.env.example` and configure:

```bash
# Database
DATABASE_URL=postgresql://xxxiii:password@localhost:5432/xxxiii

# Redis
REDIS_URL=redis://localhost:6379

# AI
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Domains
NEXT_PUBLIC_ROOT_DOMAIN=xxxiii.io
NEXT_PUBLIC_GMIIE_DOMAIN=gmiie.xxxiii.io
NEXT_PUBLIC_LPS_DOMAIN=lps.xxxiii.io

# Search
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_KEY=xxxiii_meili_dev_key
```

See `.env.example` for the complete list.

---

## Project Structure Details

### Apps

| App | Port | Domain | Purpose |
|-----|------|--------|---------|
| `hub` | 3000 | xxxiii.io | Ecosystem landing hub |
| `gmiie` | 3001 | gmiie.xxxiii.io | Intelligence feed, topics, entities, signals |
| `lps` | 3002 | lps.xxxiii.io | Protocol spec, reference implementations |
| `studio` | 3003 | studio.xxxiii.io | Admin dashboard, content management |

### Packages

| Package | Purpose |
|---------|---------|
| `@xxxiii/db` | Prisma client singleton, database schema |
| `@xxxiii/types` | Shared TypeScript interfaces and types |
| `@xxxiii/config` | Brand constants, taxonomy, navigation, colors |
| `@xxxiii/seo` | Metadata generation, JSON-LD schemas, sitemaps |
| `@xxxiii/ui` | React component library, Tailwind design system |

### Services

| Service | Language | Purpose |
|---------|----------|---------|
| `ingestion` | Python | Async data pipeline (RSS, scraping, APIs) |
| `ai-engine` | TypeScript | AI classification, scoring, content generation |
| `queue` | TypeScript | BullMQ job orchestration and scheduling |
| `publisher` | TypeScript | Content validation and publication workflow |

---

## Roadmap

### Phase 1 — Core Platform
- Intelligence ingestion pipeline
- AI classification and scoring
- GMIIE intelligence feed
- LPS protocol site

### Phase 2 — Knowledge Graph
- Entity relationship graph
- Timeline tracking
- Market maps

### Phase 3 — Research Products
- Institutional reports
- Automated weekly briefings
- Regulatory tracker

### Phase 4 — Intelligence APIs
- Developer APIs
- Partner integrations
- Enterprise dashboards

---

## Design System

- **Background**: `#0A0A0F` (near-black)
- **Surface**: `#12121A` (dark elevated)
- **Gold Accent**: `#C9A84C` (institutional gold)
- **Fonts**: Inter (body), JetBrains Mono (code/data)
- **Style**: Dark, premium, institutional aesthetic

---

## License

Proprietary. All rights reserved.

---

**Built by XXXIII** — *Infrastructure for the tokenized economy.*
