<!-- ╔══════════════════════════════════════════════════════════════╗ -->
<!-- ║  XXXIII.IO — Global Financial Infrastructure Intelligence  ║ -->
<!-- ╚══════════════════════════════════════════════════════════════╝ -->

<div align="center">

# XXXIII.IO

**Global Financial Infrastructure Intelligence**

[![Production](https://img.shields.io/badge/Production-xxxiii.io-C9A84C?style=flat-square&logo=vercel&logoColor=white)](https://xxxiii.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Next.js](https://img.shields.io/badge/Next.js-15.5-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![Prisma](https://img.shields.io/badge/Prisma-6.19-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://prisma.io)
[![Turborepo](https://img.shields.io/badge/Turborepo-Monorepo-EF4444?style=flat-square&logo=turborepo&logoColor=white)](https://turbo.build)
[![License](https://img.shields.io/badge/License-Proprietary-1a1a2e?style=flat-square)](LICENSE)

<br />

*AI-powered intelligence platform tracking tokenized assets, financial infrastructure, regulation, and institutional blockchain adoption across global capital markets.*

</div>

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [System Flow](#system-flow)
- [Monorepo Structure](#monorepo-structure)
- [Intelligence Pipeline](#intelligence-pipeline)
- [Signal Scoring System](#signal-scoring-system)
- [Database Design](#database-design)
- [AI Engine](#ai-engine)
- [Source Credibility Tiers](#source-credibility-tiers)
- [Deployment Architecture](#deployment-architecture)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Security Model](#security-model)
- [Design System](#design-system)
- [Roadmap](#roadmap)

---

## Architecture Overview

```mermaid
graph TB
    subgraph Sources["🌐 External Sources"]
        RSS["RSS Feeds"]
        Web["Web Scraping"]
        SEC["SEC EDGAR"]
        FRED["FRED API"]
        SM["Sitemaps"]
    end

    subgraph Ingestion["⚡ Ingestion Layer"]
        PY["Python Pipeline<br/><i>feedparser · Playwright · httpx</i>"]
        DD["Deduplication<br/><i>URL norm · Content hash · Title similarity</i>"]
    end

    subgraph Queue["📨 Job Orchestration"]
        RD["Redis"]
        BQ["BullMQ<br/><i>11 Queues</i>"]
    end

    subgraph AI["🧠 AI Engine"]
        CL["Classify<br/><i>GPT-4o · t=0.1</i>"]
        SC["Score<br/><i>GPT-4o · t=0.2</i>"]
        DR["Draft<br/><i>GPT-4o · t=0.4</i>"]
        SE["SEO Optimize<br/><i>GPT-4o-mini</i>"]
    end

    subgraph Storage["💾 Data Layer"]
        PG["PostgreSQL<br/><i>Neon (Production)</i>"]
        PR["Prisma ORM<br/><i>478-line schema · 15+ models</i>"]
    end

    subgraph Apps["🖥️ Applications"]
        GMIIE["GMIIE<br/><i>Intelligence Dashboard</i>"]
        HUB["Hub<br/><i>Ecosystem Portal</i>"]
        LPS["LPS<br/><i>Protocol Spec</i>"]
        STU["Studio<br/><i>Admin CMS</i>"]
    end

    subgraph Delivery["🚀 Delivery"]
        VER["Vercel Edge<br/><i>ISR + Serverless</i>"]
        CDN["CDN Cache"]
    end

    Sources --> PY --> DD --> RD
    RD --> BQ
    BQ --> CL --> SC --> DR --> SE
    SE --> PR --> PG
    PG --> Apps
    Apps --> VER --> CDN

    style Sources fill:#1a1a2e,stroke:#C9A84C,color:#e0e0e0
    style Ingestion fill:#1a1a2e,stroke:#3B82F6,color:#e0e0e0
    style Queue fill:#1a1a2e,stroke:#EF4444,color:#e0e0e0
    style AI fill:#1a1a2e,stroke:#8B5CF6,color:#e0e0e0
    style Storage fill:#1a1a2e,stroke:#10B981,color:#e0e0e0
    style Apps fill:#1a1a2e,stroke:#C9A84C,color:#e0e0e0
    style Delivery fill:#1a1a2e,stroke:#06B6D4,color:#e0e0e0
```

---

## System Flow

```mermaid
sequenceDiagram
    participant S as Sources (20+)
    participant I as Ingestion (Python)
    participant Q as Redis/BullMQ
    participant AI as AI Engine (GPT-4o)
    participant DB as PostgreSQL
    participant APP as Next.js App
    participant U as User

    S->>I: RSS/scrape/API fetch
    I->>I: Deduplicate (URL + hash + similarity)
    I->>Q: Enqueue with priority (tier-based)
    
    Q->>AI: classify job
    AI->>DB: Save classification
    
    Q->>AI: score job (9 dimensions)
    AI->>DB: Save signal scores
    
    Q->>AI: draft job (brief/analysis/deep-dive)
    AI->>DB: Save article content
    
    Q->>AI: seo job (title/meta/FAQ)
    AI->>DB: Update SEO metadata
    
    Q->>DB: review queue → PUBLISHED
    
    U->>APP: Request page
    APP->>DB: Prisma query
    DB-->>APP: Data
    APP-->>U: ISR-cached response (60-300s)
```

---

## Monorepo Structure

```
xxxiii-io/
├── apps/
│   ├── gmiie/          ← Intelligence dashboard (Next.js 15)
│   ├── hub/            ← Ecosystem landing portal
│   ├── lps/            ← Protocol specification
│   └── studio/         ← Admin CMS & editorial
│
├── packages/
│   ├── db/             ← Prisma schema, client singleton, migrations
│   ├── types/          ← Shared TypeScript interfaces
│   ├── config/         ← Brand, taxonomy, navigation constants
│   ├── seo/            ← Metadata generation, JSON-LD, sitemaps
│   └── ui/             ← React component library + Tailwind design system
│
├── services/
│   ├── ingestion/      ← Python async data pipeline
│   ├── ai-engine/      ← AI classification, scoring, generation
│   ├── queue/          ← BullMQ job orchestration (11 queues)
│   └── publisher/      ← Content validation & publication workflow
│
├── docs/
│   ├── architecture.md ← System design & diagrams
│   ├── api.md          ← API reference
│   └── strategy.md     ← Product strategy
│
├── turbo.json          ← Turborepo pipeline config
├── pnpm-workspace.yaml ← pnpm workspace definition
└── package.json        ← Root scripts & tooling
```

### Applications

| App | Port | Domain | Stack | Purpose |
|:----|:----:|:-------|:------|:--------|
| **GMIIE** | `3001` | `xxxiii.io` | Next.js 15, React 19 | Intelligence feed, entities, topics, signals, timeline |
| **Hub** | `3000` | `hub.xxxiii.io` | Next.js 15 | Ecosystem landing & product discovery |
| **LPS** | `3002` | `lps.xxxiii.io` | Next.js 15 | Ledger Protocol Specification |
| **Studio** | `3003` | `studio.xxxiii.io` | Next.js 15 | Editorial CMS, admin dashboard |

### Packages

| Package | Purpose | Key Exports |
|:--------|:--------|:------------|
| `@xxxiii/db` | Database layer | `prisma` client singleton, Prisma schema |
| `@xxxiii/types` | Type system | Shared interfaces, enums, utility types |
| `@xxxiii/config` | Constants | Brand values, taxonomy maps, navigation trees |
| `@xxxiii/seo` | SEO utilities | `generateMetadata()`, JSON-LD builders, sitemap helpers |
| `@xxxiii/ui` | Component library | React components, Tailwind theme, design tokens |

### Services

| Service | Language | Runtime | Purpose |
|:--------|:---------|:--------|:--------|
| `ingestion` | Python 3.12 | async/await | RSS polling, web scraping, API ingestion |
| `ai-engine` | TypeScript | Node.js | GPT-4o classification, scoring, content generation |
| `queue` | TypeScript | Node.js | BullMQ orchestration across 11 job queues |
| `publisher` | TypeScript | Node.js | Content validation, sanitization, status transitions |

---

## Intelligence Pipeline

```mermaid
graph LR
    subgraph Ingest["1. Ingest"]
        A1["Poll RSS"]
        A2["Scrape pages"]
        A3["Fetch APIs"]
    end

    subgraph Dedup["2. Deduplicate"]
        B1["URL normalize"]
        B2["Content hash<br/><i>xxhash</i>"]
        B3["Title similarity"]
    end

    subgraph Classify["3. Classify"]
        C1["Topic assignment"]
        C2["Entity extraction"]
        C3["Article type"]
        C4["Urgency level"]
    end

    subgraph Score["4. Score"]
        D1["9 signal<br/>dimensions"]
        D2["Weighted<br/>composite"]
    end

    subgraph Generate["5. Generate"]
        E1["Brief / Analysis /<br/>Deep Dive"]
        E2["SEO optimization"]
        E3["FAQ generation"]
    end

    subgraph Publish["6. Publish"]
        F1["Review queue"]
        F2["Validation"]
        F3["Status → PUBLISHED"]
    end

    Ingest --> Dedup --> Classify --> Score --> Generate --> Publish

    style Ingest fill:#1e3a5f,stroke:#3B82F6,color:#e0e0e0
    style Dedup fill:#1e3a5f,stroke:#3B82F6,color:#e0e0e0
    style Classify fill:#2d1b4e,stroke:#8B5CF6,color:#e0e0e0
    style Score fill:#2d1b4e,stroke:#8B5CF6,color:#e0e0e0
    style Generate fill:#1b3d2e,stroke:#10B981,color:#e0e0e0
    style Publish fill:#3d1b1b,stroke:#C9A84C,color:#e0e0e0
```

### Article Status Machine

```mermaid
stateDiagram-v2
    [*] --> INGESTED
    INGESTED --> PROCESSING : classify job
    PROCESSING --> DRAFT : AI generation
    DRAFT --> REVIEW : auto/manual
    REVIEW --> APPROVED : editor pass
    REVIEW --> REJECTED : quality fail
    APPROVED --> PUBLISHED : publish job
    PUBLISHED --> ARCHIVED : lifecycle
    REJECTED --> DRAFT : revision
```

### Queue Architecture (11 Queues)

| Queue | Concurrency | Purpose |
|:------|:-----------:|:--------|
| `ingestion` | 3 | Trigger Python fetch pipeline |
| `classify` | 5 | AI topic/entity/type classification |
| `score` | 5 | 9-dimension signal scoring |
| `draft` | 3 | AI article generation |
| `seo` | 5 | Title, meta, FAQ optimization |
| `review` | 1 | Human review queue |
| `publish` | 1 | Validation + status transition |
| `entity` | 3 | Entity profile building/refresh |
| `newsletter` | 1 | Daily/weekly digest compilation |
| `sitemap` | 1 | XML sitemap regeneration |
| `maintenance` | 1 | Cleanup, stats, health checks |

---

## Signal Scoring System

Each article is scored 1–10 across **9 intelligence dimensions**:

```mermaid
pie title Signal Score Weight Distribution
    "Regulatory Impact" : 20
    "Market Significance" : 15
    "Institutional Relevance" : 15
    "Infrastructure Dev" : 10
    "Narrative Influence" : 10
    "Geopolitical Relevance" : 10
    "Innovation Signal" : 8
    "Risk Factor" : 7
    "Temporal Urgency" : 5
```

| Dimension | Weight | Database Field | Description |
|:----------|:------:|:---------------|:------------|
| **Institutional Adoption** | 20% | `institutionalAdoption` | Enterprise/institutional engagement level |
| **Regulatory Clarity** | 15% | `regulatoryClarity` | Regulatory framework development |
| **Market Readiness** | 15% | `marketReadiness` | Market infrastructure preparedness |
| **Infrastructure Maturity** | 10% | `infrastructureMaturity` | Technical infrastructure state |
| **Settlement Impact** | 10% | `settlementImpact` | Settlement system implications |
| **Compliance Intensity** | 10% | `complianceIntensity` | Compliance burden/requirements |
| **Cross-Border Relevance** | 8% | `crossBorderRelevance` | International/cross-jurisdiction impact |
| **Liquidity Significance** | 7% | `liquiditySignificance` | Market liquidity effects |
| **Strategic Urgency** | 5% | `strategicUrgency` | Time-sensitivity of information |

### Composite GMIIE Index

Aggregate scores across all published articles in a rolling 30-day window produce the **GMIIE Composite Index** — a single-number barometer of global financial infrastructure transformation activity.

---

## Database Design

```mermaid
erDiagram
    Source ||--o{ Article : "publishes"
    Article ||--o| Signal : "has scores"
    Article }o--o{ Topic : "ArticleTopic"
    Article }o--o{ Entity : "ArticleEntity"
    Article }o--o{ Tag : "ArticleTag"
    Topic }o--|| TopicCluster : "belongs to"
    Entity }o--o{ Topic : "EntityTopic"
    Entity ||--o{ TimelineEvent : "has events"
    Article }|--o| Author : "written by"
    User ||--o{ AuditLog : "creates"

    Source {
        string name
        string slug
        string credibilityTier
        string feedUrl
        boolean isActive
    }

    Article {
        string title
        string headline
        string content
        string articleType
        string status
        float importanceScore
        datetime publishedAt
    }

    Signal {
        float institutionalAdoption
        float regulatoryClarity
        float marketReadiness
        float overallScore
    }

    Entity {
        string name
        string entityType
        string headquarters
        string country
        boolean isActive
    }

    Topic {
        string name
        string slug
        string description
        int sortOrder
    }

    TopicCluster {
        string name
        string slug
        string description
    }
```

### Key Models (15+)

| Model | Records | Purpose |
|:------|:-------:|:--------|
| `Source` | 50 | Feed configurations with credibility tiers |
| `Article` | 47+ | Full content with classification, scores, SEO metadata |
| `Topic` | 20 | Intelligence taxonomy categories |
| `TopicCluster` | 4 | High-level topic groupings |
| `Entity` | 80 | Organizations, regulators, protocols, people |
| `Signal` | per-article | 9-dimension scoring data |
| `TimelineEvent` | per-entity | Entity development timeline |
| `Tag` | variable | Content tagging system |
| `Author` | variable | Human and AI authors |
| `User` | admin | Admin authentication |
| `AuditLog` | append-only | Editorial activity tracking |
| `JobLog` | per-run | Pipeline execution history |

### Schema Design Decisions

1. **Credibility Tiers** — Sources rated `TIER_1` → `TIER_4` for weighted scoring
2. **10-State Status Machine** — `INGESTED` → `PUBLISHED` with defined transitions
3. **9D Signal Scores** — Stored as individual floats + indexed composite `overallScore`
4. **Content Hashing** — xxhash for fast deduplication at ingestion
5. **Soft Deletes** — Articles are archived, never hard-deleted
6. **Zod Runtime Validation** — Every data mapper validates against typed schemas

---

## AI Engine

### Model Selection

| Task | Model | Temperature | Rationale |
|:-----|:------|:----------:|:----------|
| Classification | GPT-4o | 0.1 | High precision, structured output |
| Signal Scoring | GPT-4o | 0.2 | Consistent numerical scoring |
| Brief Writing | GPT-4o | 0.4 | Balanced creativity/accuracy |
| Deep Analysis | GPT-4o | 0.5 | More creative freedom |
| SEO Titles | GPT-4o-mini | 0.4 | Cost-effective, pattern-based |
| Meta Descriptions | GPT-4o-mini | 0.3 | Cost-effective |
| FAQ Generation | GPT-4o | 0.3 | Structured data accuracy |

### Prompt Architecture

12 structured prompt templates across 5 categories:

```mermaid
mindmap
  root((Prompts))
    Analysis
      classify_article
      score_signal
    Generation
      write_brief
      write_analysis
      write_deep_dive
      summarize
    SEO
      generate_seo_title
      generate_meta_description
      generate_faqs
    Profile
      build_entity_profile
    Digest
      compile_newsletter
      write_daily_digest
```

All prompts use **structured JSON output schemas** for deterministic parsing. No free-form text generation — every AI response is validated against a typed schema before storage.

---

## Source Credibility Tiers

| Tier | Type | Example Sources | Treatment |
|:-----|:-----|:----------------|:----------|
| **Tier 1** | Government / Regulatory | Federal Reserve, SEC, BIS, IMF, ECB, CFTC | Authoritative — highest weight, fact basis |
| **Tier 2** | Institutional Media | Bloomberg, FT, Reuters, CoinDesk, The Block | Verified — established editorial standards |
| **Tier 3** | Industry Coverage | Ledger Insights, DL News, Blockworks, Cointelegraph | Contextual — requires cross-reference |
| **Tier 4** | Community / Independent | Analyst blogs, forums, social media | Supplementary — lowest weight, flagged |

---

## Deployment Architecture

```mermaid
graph TB
    subgraph Production["Production Stack"]
        V["Vercel<br/><i>Edge + Serverless</i>"]
        N["Neon<br/><i>PostgreSQL</i>"]
        CF["Cloudflare<br/><i>DNS + SSL</i>"]
    end

    subgraph Development["Development"]
        DC["Docker Compose"]
        LP["Local PostgreSQL"]
        LR["Local Redis"]
    end

    subgraph CI["Build Pipeline"]
        GH["GitHub<br/><i>FTHTrading/Gmiie</i>"]
        TB["Turborepo<br/><i>Cached builds</i>"]
        VC["Vercel CI<br/><i>Auto-deploy</i>"]
    end

    GH --> VC --> TB --> V
    V --> N
    V --> CF

    style Production fill:#1a2e1a,stroke:#10B981,color:#e0e0e0
    style Development fill:#1a1a2e,stroke:#3B82F6,color:#e0e0e0
    style CI fill:#2e1a2e,stroke:#8B5CF6,color:#e0e0e0
```

| Component | Platform | Scaling Strategy |
|:----------|:---------|:-----------------|
| Next.js Apps | **Vercel** | Edge + Serverless functions |
| PostgreSQL | **Neon** | Serverless, auto-scaling |
| DNS + SSL | **Cloudflare** | Global edge network |
| Queue Workers | Railway / Fly.io | Horizontal (per queue) |
| Ingestion | Railway / Fly.io | Single instance + cron |
| Search | Meilisearch Cloud | Managed |
| Object Storage | S3 / Cloudflare R2 | Unlimited |

### Domain Configuration

| Domain | Purpose | Provider |
|:-------|:--------|:---------|
| `xxxiii.io` | GMIIE production | Vercel |
| `www.xxxiii.io` | Redirect → `xxxiii.io` | Vercel |
| `donkeys.xxxiii.io` | Legacy site | Cloudflare Pages |

---

## Local Development

### Prerequisites

- **Node.js** >= 20
- **pnpm** 9.15+
- **Docker** (for PostgreSQL, Redis, Meilisearch)
- **Python** 3.12+ (for ingestion service)

### Quick Start

```bash
# Clone
git clone https://github.com/FTHTrading/Gmiie.git
cd Gmiie

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys and database URL

# Start infrastructure
docker compose -f infra/docker/docker-compose.yml up -d

# Generate Prisma client & push schema
pnpm db:generate
pnpm db:push

# Seed database (optional)
pnpm db:seed

# Build shared packages
pnpm run build --filter='./packages/*'

# Start development
pnpm dev          # All apps
pnpm dev:gmiie    # Just GMIIE (port 3001)
```

### Available Scripts

| Command | Description |
|:--------|:------------|
| `pnpm dev` | Start all apps in development |
| `pnpm dev:hub` | Hub on `localhost:3000` |
| `pnpm dev:gmiie` | GMIIE on `localhost:3001` |
| `pnpm dev:lps` | LPS on `localhost:3002` |
| `pnpm dev:studio` | Studio on `localhost:3003` |
| `pnpm build` | Build all packages and apps |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:seed` | Seed database with initial data |
| `pnpm db:studio` | Open Prisma Studio GUI |
| `pnpm test` | Run Vitest test suite (64 tests) |
| `pnpm lint` | ESLint across workspace |
| `pnpm clean` | Remove all build artifacts |

---

## Environment Variables

```bash
# ── Database ──────────────────────────────
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# ── Redis ─────────────────────────────────
REDIS_URL=redis://localhost:6379

# ── AI ────────────────────────────────────
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# ── Domains ───────────────────────────────
NEXT_PUBLIC_ROOT_DOMAIN=xxxiii.io
NEXT_PUBLIC_GMIIE_DOMAIN=gmiie.xxxiii.io

# ── Search ────────────────────────────────
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_KEY=xxxiii_meili_dev_key
```

---

## Security Model

### Authentication & Access

| Surface | Method | Roles |
|:--------|:-------|:------|
| Studio (CMS) | NextAuth.js | `ADMIN`, `EDITOR`, `ANALYST`, `VIEWER` |
| Public Apps | None required | Open access |
| Services | Internal network | No public exposure |

### Content Security

- **HTML Sanitization** — `sanitize-html` with allowlisted tags
- **External Links** — `rel="noopener noreferrer nofollow"`
- **Input Validation** — Zod schemas at every boundary
- **SQL Injection** — Prevented by Prisma parameterized queries
- **Content Integrity** — xxhash deduplication, immutable article history
- **Audit Logging** — All editorial actions tracked
- **Secret Isolation** — Environment variable separation per deployment

---

## Design System

| Token | Value | Usage |
|:------|:------|:------|
| `background` | `#0A0A0F` | Page background |
| `surface` | `#12121A` | Cards, panels |
| `surface-elevated` | `#1A1A28` | Modals, dropdowns |
| `gold` | `#C9A84C` | Primary accent, CTAs |
| `text-primary` | `#F0F0F5` | Headlines, body |
| `text-secondary` | `#A0A0B8` | Supporting text |
| `text-muted` | `#5A5A78` | Labels, captions |
| `border-subtle` | `#1E1E30` | Card borders |
| Font Sans | Inter | Body text |
| Font Mono | JetBrains Mono | Data, labels, code |

The visual language draws from Bloomberg Terminal discipline — dark, premium, data-dense, institutional-grade.

---

## Roadmap

```mermaid
timeline
    title XXXIII.IO Development Phases
    section Phase 1 — Core Platform ✅
        Intelligence pipeline : Ingestion + AI
        GMIIE dashboard : Feed, entities, topics, signals
        Signal scoring : 9-dimension system
        Production deploy : Vercel + Neon
    section Phase 2 — Knowledge Graph
        Entity relationships : Graph visualization
        Timeline tracking : Event correlation
        Market maps : Sector analysis
    section Phase 3 — Research Products
        Institutional reports : PDF generation
        Weekly briefings : Automated digests
        Regulatory tracker : Real-time alerts
    section Phase 4 — Intelligence APIs
        Developer APIs : REST + GraphQL
        Partner integrations : Data feeds
        Enterprise dashboards : Custom views
```

---

## Tech Stack

| Layer | Technology | Version |
|:------|:-----------|:-------:|
| **Runtime** | Node.js | 20+ |
| **Framework** | Next.js | 15.5 |
| **UI** | React | 19 |
| **Language** | TypeScript | 5.9 |
| **Styling** | Tailwind CSS | 4.x |
| **Database** | PostgreSQL (Neon) | 16 |
| **ORM** | Prisma | 6.19 |
| **Validation** | Zod | 3.x |
| **Testing** | Vitest | latest |
| **Build** | Turborepo | latest |
| **Package Manager** | pnpm | 9.15 |
| **AI** | OpenAI GPT-4o | latest |
| **Queue** | BullMQ + Redis | latest |
| **Ingestion** | Python 3.12 | async |
| **Deployment** | Vercel | Edge |
| **DNS** | Cloudflare | — |

---

<div align="center">

**Built by XXXIII** · *Infrastructure for the tokenized economy*

[xxxiii.io](https://xxxiii.io)

</div>
