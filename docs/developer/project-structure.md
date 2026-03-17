# Project Structure

> **Status:** Complete · **Last Updated:** 2025-01

## Monorepo Layout

```
Gmiie/
├── apps/                          # Consumer-facing applications
│   ├── hub/                       # Central dashboard (:3000)
│   │   ├── src/
│   │   │   ├── app/               # Next.js App Router pages
│   │   │   ├── components/        # Hub-specific components
│   │   │   ├── lib/               # Utilities, helpers
│   │   │   └── styles/            # Hub styles
│   │   ├── public/                # Static assets
│   │   ├── next.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── gmiie/                     # Public intelligence feed (:3001)
│   │   ├── src/
│   │   │   ├── app/               # Next.js App Router pages
│   │   │   ├── components/        # GMIIE-specific components
│   │   │   ├── lib/               # Data fetching, utilities
│   │   │   └── styles/            # GMIIE styles
│   │   ├── public/
│   │   ├── next.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── lps/                       # Landing pages (:3002)
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   └── styles/
│   │   ├── public/
│   │   ├── next.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── studio/                    # Editorial tool (:3003)
│       ├── src/
│       │   ├── app/
│       │   ├── components/
│       │   ├── lib/
│       │   └── styles/
│       ├── public/
│       ├── next.config.ts
│       ├── package.json
│       └── tsconfig.json
│
├── packages/                      # Shared packages
│   ├── db/                        # @xxxiii/db — Database layer
│   │   ├── prisma/
│   │   │   ├── schema.prisma      # 478+ lines, 15+ models
│   │   │   ├── migrations/        # Prisma migrations history
│   │   │   └── seed.ts            # Database seed script
│   │   ├── src/
│   │   │   ├── client.ts          # Prisma client export
│   │   │   └── index.ts           # Package entry
│   │   └── package.json
│   │
│   ├── types/                     # @xxxiii/types — Type definitions
│   │   ├── src/
│   │   │   ├── models.ts          # TypeScript interfaces
│   │   │   ├── schemas.ts         # Zod validation schemas
│   │   │   ├── enums.ts           # Shared enumerations
│   │   │   └── index.ts           # Package entry
│   │   └── package.json
│   │
│   ├── config/                    # @xxxiii/config — Shared configuration
│   │   ├── eslint/                # ESLint presets
│   │   ├── typescript/            # TypeScript base configs
│   │   ├── tailwind/              # Tailwind CSS presets
│   │   └── package.json
│   │
│   ├── seo/                       # @xxxiii/seo — SEO utilities
│   │   ├── src/
│   │   │   ├── meta.ts            # Meta tag generation
│   │   │   ├── sitemap.ts         # Sitemap generation
│   │   │   ├── structured-data.ts # JSON-LD helpers
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── ui/                        # @xxxiii/ui — Design system
│       ├── src/
│       │   ├── components/        # Shared React components
│       │   ├── primitives/        # Base UI primitives
│       │   ├── tokens/            # Design tokens
│       │   └── index.ts
│       └── package.json
│
├── services/                      # Backend services
│   ├── ingestion/                 # Python content ingestion
│   │   ├── main.py                # FastAPI entry point
│   │   ├── feeds/                 # Feed parser modules
│   │   ├── scrapers/              # Playwright scrapers
│   │   ├── requirements.txt
│   │   └── README.md
│   │
│   ├── ai-engine/                 # AI processing service
│   │   ├── src/
│   │   │   ├── prompts/           # 12+ prompt templates
│   │   │   ├── processors/        # Classification, scoring, drafting
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── queue/                     # BullMQ worker service
│       ├── src/
│       │   ├── workers/           # Queue-specific workers
│       │   ├── config.ts          # Queue configuration
│       │   └── index.ts
│       └── package.json
│
├── data/                          # Data files
│   └── entity-seeds/             # Entity seed data
│       └── README.md
│
├── infra/                         # Infrastructure
│   └── scripts/
│       └── setup.sh               # Infrastructure setup script
│
├── docs/                          # Documentation
│   ├── README.md                  # Documentation index
│   ├── api.md                     # API reference
│   ├── architecture.md            # Technical architecture
│   ├── strategy.md                # Product strategy
│   ├── architecture/              # Architecture deep-dives
│   ├── security/                  # Security documentation
│   ├── operations/                # Operations & deployment
│   ├── developer/                 # Developer guides
│   ├── product/                   # Roadmap & features
│   ├── api/                       # API documentation
│   ├── compliance/                # Governance & compliance
│   └── diagrams/                  # Diagram index
│
├── .github/                       # GitHub configuration
│   ├── workflows/                 # CI/CD pipelines
│   │   ├── ci.yml                 # Main CI pipeline
│   │   ├── pipeline.yml           # Extended pipeline
│   │   └── README.md              # Workflow documentation
│   ├── ISSUE_TEMPLATE/            # Issue templates
│   └── pull_request_template.md   # PR template
│
├── turbo.json                     # Turborepo configuration
├── pnpm-workspace.yaml            # pnpm workspace definition
├── package.json                   # Root package.json
├── tsconfig.json                  # Root TypeScript config
├── .gitignore
├── .env.example                   # Environment variable template
├── LICENSE                        # Proprietary license
├── README.md                      # Project overview (700+ lines)
├── SECURITY.md                    # Security policy
├── CONTRIBUTING.md                # Contribution guide
└── CODEOWNERS                     # Code ownership
```

## Architecture Patterns

### View-Model Contract

Every feature in the monorepo follows the [View-Model Contract](../architecture/view-model-contract.md) pattern:

```
models.ts → schemas.ts → data.ts → validateOne/validateMany → Component
```

1. **models.ts** — TypeScript interfaces
2. **schemas.ts** — Zod validation schemas
3. **data.ts** — Data fetching with validation
4. **Component** — React component consuming validated data

### File Naming Conventions

| Pattern | Usage |
|---------|-------|
| `kebab-case.ts` | All source files |
| `PascalCase.tsx` | React components |
| `UPPER_CASE` | Constants files |
| `*.test.ts` | Test files (colocated or in `tests/`) |
| `*.config.ts` | Configuration files |

## Cross-References

- [Setup Guide](setup.md) — Getting started locally
- [Contributing](contributing.md) — Code standards
- [Component Map](../architecture/component-map.md) — Package dependencies
