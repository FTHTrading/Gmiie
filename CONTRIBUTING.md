# Contributing to XXXIII.IO

Thank you for your interest in contributing to the XXXIII.IO platform. This document outlines the standards, workflows, and conventions we follow.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branch Strategy](#branch-strategy)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)
- [Code Standards](#code-standards)
- [Architecture Patterns](#architecture-patterns)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)

---

## Code of Conduct

Be professional, constructive, and respectful. This is infrastructure software — precision, clarity, and reliability matter above all.

## Getting Started

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥ 20 | Runtime |
| pnpm | ≥ 9.15 | Package manager |
| Docker | Latest | Local infrastructure (PostgreSQL, Redis, Meilisearch) |
| Python | ≥ 3.12 | Ingestion service |

### Setup

```bash
git clone https://github.com/FTHTrading/Gmiie.git
cd Gmiie
pnpm install
cp .env.example .env
# Edit .env with your API keys and database URL

docker compose -f infra/docker/docker-compose.yml up -d
pnpm db:generate
pnpm db:push
pnpm db:seed          # Optional — loads sample data
pnpm run build --filter='./packages/*'
pnpm dev
```

## Development Workflow

1. Create a branch from `main`
2. Make changes following the patterns below
3. Run checks locally: `pnpm turbo typecheck test build`
4. Open a pull request
5. Address review feedback
6. Merge after approval + CI pass

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `feature/<name>` | New features |
| `fix/<name>` | Bug fixes |
| `docs/<name>` | Documentation changes |
| `refactor/<name>` | Code restructuring |

## Commit Conventions

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

### Types

| Type | Purpose |
|------|---------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting, no logic change |
| `refactor` | Code restructuring |
| `test` | Adding or updating tests |
| `chore` | Build, CI, tooling |
| `perf` | Performance improvement |

### Scopes

Use the package or app name: `gmiie`, `hub`, `lps`, `studio`, `db`, `ui`, `config`, `seo`, `types`, `queue`, `ingestion`, `ai-engine`, `infra`, `docs`.

### Examples

```
feat(gmiie): add entity relationship graph visualization
fix(db): correct signal score aggregation query
docs(api): update entity endpoint response schema
chore(infra): upgrade Docker Compose to v2 format
test(gmiie): add contract tests for timeline view-model
```

## Pull Request Process

1. **Title**: Use conventional commit format
2. **Description**: Fill out the PR template completely
3. **Size**: Keep PRs focused — one concern per PR
4. **Tests**: Include tests for new features, update tests for changes
5. **Docs**: Update documentation if behavior changes
6. **Review**: Minimum one approval required
7. **CI**: All checks must pass before merge

## Code Standards

### TypeScript / JavaScript

- **Strict mode**: `strict: true` in all `tsconfig.json`
- **Explicit types**: No implicit `any`
- **Named exports**: Prefer over default exports
- **Path aliases**: Use `@/` for app-internal imports
- **Package imports**: Use `@xxxiii/<package>` for shared code
- **No barrel files**: Import directly from source modules

### Python (Ingestion Service)

- **Type hints**: Required on all function signatures
- **Async**: Use `async/await` for I/O operations
- **Structured logging**: Use `structlog` — no `print()` statements
- **Pydantic**: Use for all data validation and serialization

### CSS / Styling

- **Tailwind CSS 4.x**: Utility-first, no custom CSS unless necessary
- **Design tokens**: Use the shared `@xxxiii/ui` Tailwind configuration
- **Responsive**: Mobile-first approach
- **Dark mode**: All UIs use the dark theme from the design system

## Architecture Patterns

### View-Model Contract Pattern

All data flowing from the database to the UI follows a strict three-layer contract. See [docs/architecture/view-model-contract.md](docs/architecture/view-model-contract.md) for the full specification.

| Layer | File | Responsibility |
|-------|------|----------------|
| Data | `src/lib/data.ts` | Prisma queries with explicit `select`, mapper functions |
| Types | `src/lib/models.ts` | Canonical TypeScript interfaces per view boundary |
| Validation | `src/lib/schemas.ts` | Zod schemas mirroring `models.ts` |

### Adding a New Feature Checklist

- [ ] Define view-model type in `models.ts`
- [ ] Create Zod schema in `schemas.ts`
- [ ] Write Prisma query + mapper in `data.ts`
- [ ] Wrap return through `validateOne()` or `validateMany()`
- [ ] Import type from `@/lib/models` in components
- [ ] Add contract tests in `__tests__/schemas.contract.test.ts`
- [ ] Add empty-state tests in `__tests__/schemas.empty-states.test.ts`

## Testing Requirements

### Test Types

| Type | Framework | Scope |
|------|-----------|-------|
| Contract tests | Vitest | Zod schema validation — valid data passes, invalid rejects |
| Empty-state tests | Vitest | Null, zero, empty array edge cases |
| Smoke tests | Custom (Node.js) | HTTP health checks on production build |

### Running Tests

```bash
pnpm turbo test             # All tests across monorepo
pnpm turbo typecheck        # TypeScript compilation check
pnpm --filter @xxxiii/gmiie smoke  # Route-level health (post-build)
```

### CI Gate

Every PR must pass:

1. `pnpm turbo typecheck` — compile-time correctness
2. `pnpm turbo test` — contract + empty-state schema validation
3. `pnpm turbo build` — production build
4. Smoke test — route-level health post-build

## Documentation

- Update `docs/` when behavior, architecture, or APIs change
- Use Mermaid diagrams for architecture and flow documentation
- Keep the README.md summary aligned with actual capabilities
- Mark planned features clearly — never document aspirational work as existing
