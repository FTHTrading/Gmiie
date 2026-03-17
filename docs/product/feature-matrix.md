# Feature Matrix

> **Status:** Active · **Last Updated:** 2025-01

## Legend

| Status | Meaning |
|--------|---------|
| **Existing** | Implemented and active in production |
| **In Progress** | Currently under development |
| **Planned** | Scoped and scheduled for upcoming phases |
| **Deferred** | Considered but not currently prioritized |

---

## Platform Infrastructure

| Feature | Status | Component | Notes |
|---------|--------|-----------|-------|
| Turborepo monorepo | Existing | Root | pnpm workspaces, turbo.json |
| pnpm workspace management | Existing | Root | v9.15+ |
| TypeScript strict mode | Existing | All | v5.9 |
| ESLint shared config | Existing | @xxxiii/config | Consistent linting |
| Tailwind CSS 4.x | Existing | @xxxiii/config | Shared presets |
| Vitest testing framework | Existing | All | 64 tests |
| GitHub Actions CI | Existing | .github/workflows | lint, type-check, build, test |
| Vercel deployment | Existing | All apps | Auto-deploy on merge |
| Cloudflare DNS/SSL | Existing | Infrastructure | Edge protection |
| Dependabot | Existing | .github | Dependency alerts |
| Preview deployments | Planned | Vercel | Per-PR preview URLs |
| Dependency audit CI step | Planned | .github/workflows | Automated security audit |
| Release workflow | Planned | .github/workflows | Semantic versioning |

## Applications

### Hub (Central Dashboard)

| Feature | Status | Notes |
|---------|--------|-------|
| System health overview | Existing | Pipeline status, queue depths |
| Content management | Existing | Article list, filtering |
| NextAuth.js authentication | Existing | Session-based, RBAC |
| Analytics dashboard | Planned | Content performance metrics |
| User management | Planned | Team roles, permissions |

### GMIIE (Public Intelligence Feed)

| Feature | Status | Notes |
|---------|--------|-------|
| Article feed | Existing | Chronological, categorized |
| Topic categorization | Existing | AI-classified topics |
| Entity tagging | Existing | Named entities in articles |
| Signal indicators | In Progress | Market signal scores |
| Search | Planned | Full-text, faceted search |
| Personalized feeds | Planned | User topic preferences |
| RSS output | Deferred | Public RSS feed generation |

### LPS (Landing Pages)

| Feature | Status | Notes |
|---------|--------|-------|
| Marketing pages | Existing | Static content |
| SEO optimization | Existing | Meta tags, structured data |
| Lead capture | Planned | Contact forms, CTA |
| A/B testing | Deferred | Landing page optimization |

### Studio (Editorial Tool)

| Feature | Status | Notes |
|---------|--------|-------|
| Article editor | Existing | Rich text editing |
| Editorial review queue | Existing | AI-drafted content review |
| NextAuth.js RBAC | Existing | Admin, editor, viewer roles |
| Bulk operations | Planned | Multi-article actions |
| Content calendar | Deferred | Publication scheduling |

## Data Layer

| Feature | Status | Notes |
|---------|--------|-------|
| Prisma ORM | Existing | v6.19, 15+ models |
| Neon PostgreSQL | Existing | Managed, SSL-enforced |
| Zod validation | Existing | Runtime type safety |
| View-Model Contract | Existing | Architecture standard |
| Database migrations | Existing | Prisma Migrate |
| Audit logging | Existing | AuditLog model |
| Full-text search indexes | Planned | PostgreSQL tsvector |
| Read replicas | Deferred | Query scaling |

## Intelligence Pipeline

| Feature | Status | Notes |
|---------|--------|-------|
| RSS feed ingestion | Existing | feedparser (Python) |
| Web scraping | Existing | Playwright (Python) |
| API polling | Existing | httpx (Python) |
| BullMQ queue system | Existing | 11 queues, Redis |
| AI topic classification | In Progress | GPT-4o |
| Signal scoring | In Progress | Market relevance scoring |
| Content drafting | In Progress | AI-assisted article generation |
| Entity extraction | In Progress | Named entity recognition |
| SEO auto-generation | Planned | Meta, OG, JSON-LD |
| Sentiment analysis | Planned | Market sentiment scoring |
| Trend detection | Planned | Cross-article patterns |
| Knowledge graph | Deferred | Entity relationship mapping |

## AI Engine

| Feature | Status | Notes |
|---------|--------|-------|
| GPT-4o integration | Existing | Structured JSON output |
| 12+ prompt templates | Existing | 5 categories |
| Classification prompts | Existing | Topic, category |
| Scoring prompts | In Progress | Signal relevance |
| Drafting prompts | In Progress | Content generation |
| SEO prompts | Planned | Meta generation |
| Prompt versioning | Planned | Template version tracking |
| Output quality metrics | Planned | Accuracy measurement |
| Fine-tuning pipeline | Deferred | Domain-specific tuning |

## Security

| Feature | Status | Notes |
|---------|--------|-------|
| NextAuth.js authentication | Existing | Hub, Studio |
| RBAC authorization | Existing | Admin, editor, viewer |
| Zod input validation | Existing | All API boundaries |
| sanitize-html | Existing | Content sanitization |
| CSRF protection | Existing | NextAuth.js tokens |
| SSL/TLS (Cloudflare) | Existing | All external traffic |
| Environment variable security | Existing | Vercel encrypted |
| MFA | Planned | Studio/Hub multi-factor |
| API rate limiting (per-endpoint) | Planned | Granular rate limits |
| Security audit logging | Planned | Enhanced audit trail |
| Penetration testing | Deferred | Third-party security audit |

## Developer Experience

| Feature | Status | Notes |
|---------|--------|-------|
| TypeScript strict mode | Existing | No implicit any |
| Hot module reload | Existing | Next.js 15 fast refresh |
| Prisma Studio (GUI) | Existing | Data inspection |
| Contract testing | Existing | Zod schema validation |
| Empty-state testing | Existing | Graceful empty handling |
| Smoke testing | Existing | Basic render checks |
| Documentation (README) | Existing | 700+ lines |
| Contributing guide | Existing | CONTRIBUTING.md |
| PR templates | Existing | .github templates |
| Issue templates | Existing | Bug, feature, docs |
| E2E testing | Planned | Playwright browser tests |
| API documentation (OpenAPI) | Planned | Auto-generated specs |
| Developer CLI | Deferred | Custom dev commands |

## Cross-References

- [Roadmap](roadmap.md) — Phase timeline and workstreams
- [System Overview](../architecture/system-overview.md) — Architecture
- [Component Map](../architecture/component-map.md) — Package relationships
