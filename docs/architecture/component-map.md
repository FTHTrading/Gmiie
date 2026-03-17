# Component Map

> **Status:** Complete · **Last Updated:** 2025-01

## Monorepo Dependency Graph

```mermaid
graph TD
  subgraph Apps
    HUB[apps/hub]
    GMIIE[apps/gmiie]
    LPS[apps/lps]
    STUDIO[apps/studio]
  end

  subgraph Packages
    DB["@xxxiii/db"]
    TYPES["@xxxiii/types"]
    CONFIG["@xxxiii/config"]
    SEO["@xxxiii/seo"]
    UI["@xxxiii/ui"]
  end

  subgraph Services
    ING[services/ingestion]
    AIE[services/ai-engine]
    QUE[services/queue]
  end

  HUB --> DB
  HUB --> TYPES
  HUB --> CONFIG
  HUB --> UI

  GMIIE --> DB
  GMIIE --> TYPES
  GMIIE --> CONFIG
  GMIIE --> SEO
  GMIIE --> UI

  LPS --> CONFIG
  LPS --> SEO
  LPS --> UI

  STUDIO --> DB
  STUDIO --> TYPES
  STUDIO --> CONFIG
  STUDIO --> UI

  AIE --> DB
  AIE --> TYPES
  QUE --> DB
  QUE --> TYPES
  QUE --> AIE

  SEO --> TYPES
  UI --> CONFIG
```

## Package Responsibilities

### @xxxiii/db
- Prisma schema (478+ lines, 15+ models)
- Client generation and exports
- Migration management
- Seed scripts

### @xxxiii/types
- Shared TypeScript interfaces
- Zod validation schemas (models.ts → schemas.ts)
- API request/response types
- Enum definitions (categories, tiers, statuses)

### @xxxiii/config
- ESLint configurations (shared rules)
- TypeScript base configs (tsconfig)
- Tailwind CSS presets
- PostCSS configuration

### @xxxiii/seo
- Meta tag generation
- Open Graph / Twitter Card helpers
- Sitemap generation
- JSON-LD structured data

### @xxxiii/ui
- Design system primitives
- Shared React components
- Theme tokens and CSS variables
- Layout components

## Service Boundaries

```mermaid
graph LR
  subgraph External
    RSS[RSS Feeds]
    OPENAI[OpenAI API]
    REDIS[(Redis)]
    NEON[(Neon PostgreSQL)]
  end

  subgraph Internal
    ING[Ingestion Service]
    AIE[AI Engine]
    QUE[Queue Workers]
  end

  RSS -->|feedparser, Playwright| ING
  ING -->|enqueue| REDIS
  REDIS -->|dequeue| QUE
  QUE -->|prompt| AIE
  AIE -->|GPT-4o| OPENAI
  QUE -->|write| NEON
  AIE -->|write| NEON
```

## Data Model Overview

| Model | Purpose | Key Relations |
|-------|---------|---------------|
| Article | Core content entity | → Topics, Entities, Signals |
| Topic | Category classification | → Articles (many-to-many) |
| Entity | Named entity (company, person, etc.) | → Articles, EntityMention |
| Signal | Market signal score | → Article |
| Source | Content source definition | → Articles |
| Feed | RSS feed configuration | → Source |
| Draft | AI-generated draft content | → Article |
| SeoMeta | SEO metadata | → Article |
| User | Platform user (Studio) | → Sessions, Accounts |
| Session | Auth session | → User |
| Account | OAuth account link | → User |
| QueueJob | Job tracking | — |
| AuditLog | System audit trail | → User |
| Newsletter | Newsletter content | → Articles |
| Sitemap | Sitemap entries | → Article |

## Cross-References

- [System Overview](system-overview.md) — High-level architecture
- [View-Model Contract](view-model-contract.md) — Data flow pattern
- [Project Structure](../developer/project-structure.md) — File system layout
