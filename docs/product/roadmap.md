# Product Roadmap

> **Status:** Active · **Last Updated:** 2025-01

## Vision

XXXIII.IO is building the definitive real-time financial intelligence platform — ingesting, classifying, scoring, and delivering market-moving content through AI-powered analysis and editorial curation.

## Roadmap Phases

```mermaid
gantt
    title XXXIII.IO Product Roadmap
    dateFormat YYYY-Q
    axisFormat %Y-Q%q

    section Foundation
    Phase 1 - Repository Foundation     :done, p1, 2024-Q3, 2024-Q4
    Phase 2 - Core Platform             :done, p2, 2024-Q3, 2025-Q1

    section Intelligence
    Phase 3 - Intelligence Pipeline     :active, p3, 2025-Q1, 2025-Q2
    Phase 4 - AI Enhancement            :p4, 2025-Q2, 2025-Q3

    section Scale
    Phase 5 - Scale & Performance       :p5, 2025-Q3, 2025-Q4
    Phase 6 - Analytics & Insights      :p6, 2025-Q3, 2025-Q4

    section Product
    Phase 7 - User Experience           :p7, 2025-Q4, 2026-Q1
    Phase 8 - Monetization              :p8, 2026-Q1, 2026-Q2

    section Ecosystem
    Phase 9 - Ecosystem & Extensions    :p9, 2026-Q2, 2026-Q3
```

## Phase Details

### Phase 1 — Repository Foundation `Complete`

Establish the monorepo, tooling, CI/CD, and documentation infrastructure.

| Workstream | Status | Priority | Owner | Notes |
|-----------|--------|----------|-------|-------|
| Turborepo monorepo setup | Complete | P0 | @FTHTrading/core | pnpm workspaces, turbo.json |
| CI/CD pipeline | Complete | P0 | @FTHTrading/core | GitHub Actions: lint, type-check, build, test |
| Shared packages | Complete | P0 | @FTHTrading/core | db, types, config, seo, ui |
| Documentation foundation | Complete | P1 | @FTHTrading/core | README, architecture, API docs |
| GitHub community files | Complete | P1 | @FTHTrading/core | LICENSE, SECURITY, CONTRIBUTING, templates |

### Phase 2 — Core Platform `Complete`

Build the four consumer applications and database layer.

| Workstream | Status | Priority | Owner | Notes |
|-----------|--------|----------|-------|-------|
| Hub application | Complete | P0 | @FTHTrading/core | Dashboard, system health |
| GMIIE application | Complete | P0 | @FTHTrading/core | Public intelligence feed |
| LPS application | Complete | P1 | @FTHTrading/core | Landing pages |
| Studio application | Complete | P0 | @FTHTrading/core | Editorial tools, NextAuth |
| Prisma schema & migrations | Complete | P0 | @FTHTrading/core | 15+ models, 478+ lines |
| Design system (ui package) | Complete | P1 | @FTHTrading/core | Shared components |
| View-Model Contract pattern | Complete | P0 | @FTHTrading/core | Architecture standard |
| Testing framework | Complete | P1 | @FTHTrading/core | Vitest, 64 tests |

### Phase 3 — Intelligence Pipeline `In Progress`

Automated content ingestion, classification, scoring, and publishing.

| Workstream | Status | Priority | Owner | Notes |
|-----------|--------|----------|-------|-------|
| Python ingestion service | Complete | P0 | @FTHTrading/core | feedparser, Playwright, httpx |
| BullMQ queue system | Complete | P0 | @FTHTrading/core | 11 queues configured |
| AI classification engine | In Progress | P0 | @FTHTrading/core | GPT-4o topic classification |
| Signal scoring | In Progress | P0 | @FTHTrading/core | Market signal analysis |
| Content drafting | In Progress | P1 | @FTHTrading/core | AI-assisted article drafting |
| SEO generation | Planned | P1 | @FTHTrading/core | Automated meta, OG, structured data |
| Entity extraction | In Progress | P0 | @FTHTrading/core | Named entity recognition |
| Source credibility tiers | Complete | P1 | @FTHTrading/core | Tier 1-4 source ranking |

### Phase 4 — AI Enhancement `Planned`

Deepen AI capabilities and introduce advanced analysis.

| Workstream | Status | Priority | Owner | Notes |
|-----------|--------|----------|-------|-------|
| Sentiment analysis | Planned | P1 | — | Market sentiment scoring |
| Trend detection | Planned | P1 | — | Cross-article trend identification |
| Entity relationship mapping | Planned | P2 | — | Knowledge graph construction |
| Custom prompt tuning | Planned | P2 | — | Domain-specific fine-tuning |
| AI output quality metrics | Planned | P1 | — | Accuracy, relevance measurement |

### Phase 5 — Scale & Performance `Planned`

Optimize for high throughput and reliability.

| Workstream | Status | Priority | Owner | Notes |
|-----------|--------|----------|-------|-------|
| Database query optimization | Planned | P1 | — | Index tuning, query analysis |
| CDN and caching strategy | Planned | P1 | — | Edge caching, ISR optimization |
| Queue throughput tuning | Planned | P2 | — | Worker concurrency, batching |
| Load testing | Planned | P2 | — | Stress tests, capacity planning |
| Monitoring and alerting | Planned | P1 | — | Error tracking, uptime monitoring |

### Phase 6 — Analytics & Insights `Planned`

Platform analytics and content performance measurement.

| Workstream | Status | Priority | Owner | Notes |
|-----------|--------|----------|-------|-------|
| Content performance metrics | Planned | P1 | — | Views, engagement, signal accuracy |
| Source quality analytics | Planned | P2 | — | Source reliability scoring |
| Pipeline health dashboard | Planned | P1 | — | Queue metrics, processing latency |
| User engagement analytics | Planned | P2 | — | Reader behavior analysis |

### Phase 7 — User Experience `Planned`

Polish the consumer experience.

| Workstream | Status | Priority | Owner | Notes |
|-----------|--------|----------|-------|-------|
| Advanced search and filtering | Planned | P1 | — | Faceted search, saved filters |
| Personalized feeds | Planned | P2 | — | Topic and entity preferences |
| Newsletter system | Planned | P1 | — | Automated digest compilation |
| Mobile optimization | Planned | P2 | — | Responsive refinement, PWA |

### Phase 8 — Monetization `Planned`

Revenue generation capabilities.

| Workstream | Status | Priority | Owner | Notes |
|-----------|--------|----------|-------|-------|
| Premium content tiers | Planned | P1 | — | Gated content, subscriber access |
| API access for partners | Planned | P2 | — | Rate-limited partner API |
| Sponsored content system | Planned | P3 | — | Clearly labeled sponsored placements |
| Subscription management | Planned | P1 | — | Billing, plan management |

### Phase 9 — Ecosystem & Extensions `Planned`

Expand the platform ecosystem.

| Workstream | Status | Priority | Owner | Notes |
|-----------|--------|----------|-------|-------|
| Public API v2 | Planned | P2 | — | Versioned, documented, rate-limited |
| Webhook integrations | Planned | P3 | — | Real-time event notifications |
| Third-party data sources | Planned | P2 | — | SEC filings, earnings data |
| Plugin / extension system | Deferred | P3 | — | Custom analysis modules |

## Cross-References

- [Feature Matrix](feature-matrix.md) — Current feature status
- [Strategy](../strategy.md) — Product and platform strategy
- [System Overview](../architecture/system-overview.md) — Technical architecture
