# GMIIE Architecture Standard: View-Model Contract Pattern

> **Version:** 1.0 — Phase 8f  
> **Scope:** All apps in the xxxiii.io monorepo  
> **Status:** Active

---

<br/>

<div align="center">

## 📂 Gmiie-Content-Platform — Repository Table of Contents

![TypeScript](https://img.shields.io/badge/TypeScript-54.8%25-3178C6?style=flat-square&logo=typescript&logoColor=white)
![HCL](https://img.shields.io/badge/HCL-42.0%25-7B42BC?style=flat-square&logo=terraform&logoColor=white)
![Docker](https://img.shields.io/badge/Dockerfile-2.6%25-2496ED?style=flat-square&logo=docker&logoColor=white)
![HTML](https://img.shields.io/badge/HTML-0.6%25-E34F26?style=flat-square&logo=html5&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-22C55E?style=flat-square)
![CI](https://img.shields.io/badge/CI-GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white)
![Node](https://img.shields.io/badge/Node.js-20-339933?style=flat-square&logo=nodedotjs&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-workspace-F69220?style=flat-square&logo=pnpm&logoColor=white)

</div>

<br/>

> **Legend:**
> 🟦 = TypeScript / Application Code &nbsp;|&nbsp;
> 🟪 = Infrastructure (HCL / Terraform) &nbsp;|&nbsp;
> 🟧 = CI/CD & Automation &nbsp;|&nbsp;
> 🟩 = Documentation &nbsp;|&nbsp;
> ⬜ = Configuration &nbsp;|&nbsp;
> 🟥 = Security & Governance

---

### 🏗️ Top-Level Structure

```
FTHTrading/Gmiie-Content-Platform (private)
├── 🟧 .github/              CI/CD workflows & repo automation
├── 🟦 apps/                  Application packages (API, Web)
├── 🟩 docs/                  Architecture & project documentation
├── 🟪 infra/                 AWS infrastructure-as-code (Terraform/HCL)
├── 🟦 packages/              Shared libraries & internal packages
└──    ⚙️  Config & Meta Files
```

---

### 📁 Directory Breakdown

| Icon | Path | Purpose | Language / Stack |
|:----:|:-----|:--------|:-----------------|
| 🟧 | **`.github/`** | GitHub Actions workflows, PR templates, issue templates | YAML |
| 🟧 | `.github/workflows/ci.yml` | Build, lint, typecheck, test on push/PR | GitHub Actions |
| 🟧 | `.github/workflows/deploy.yml` | Deploy API → ECS, Web → S3 + CloudFront | GitHub Actions |
| | | | |
| 🟦 | **`apps/`** | Deployable applications (monorepo workspaces) | TypeScript |
| 🟦 | `apps/api/` | Backend REST/GraphQL service | Node.js / Express |
| 🟦 | `apps/web/` | Frontend web application | Next.js / React |
| | | | |
| 🟩 | **`docs/`** | Project & architecture documentation | Markdown |
| 🟩 | `docs/architecture/` | System design, patterns, ADRs | Markdown |
| | | | |
| 🟪 | **`infra/`** | Cloud infrastructure definitions | HCL (Terraform) |
| 🟪 | `infra/` | ECS, S3, CloudFront, IAM, VPC, RDS | Terraform / AWS |
| | | | |
| 🟦 | **`packages/`** | Shared internal libraries | TypeScript |
| 🟦 | `packages/db/` | Prisma client & schema (`@xxxiii/db`) | Prisma / TS |
| 🟦 | `packages/config/` | Shared tsconfig, ESLint, Tailwind presets | JSON / TS |

---

### 📄 Root Files

| Icon | File | Purpose |
|:----:|:-----|:--------|
| ⬜ | `.dockerignore` | Docker build exclusions |
| ⬜ | `.env.example` | Environment variable template — **copy to `.env.local`** |
| ⬜ | `.gitignore` | Git tracking exclusions |
| ⬜ | `.nvmrc` | Pin Node.js version (`20`) |
| 🟥 | `CODEOWNERS` | PR review ownership rules |
| 🟩 | `CONTRIBUTING.md` | Contribution guidelines & workflow |
| 🟩 | `LICENSE` | MIT License |
| 🟩 | `README.md` | Repo overview, setup, CI/CD reference |
| 🟥 | `SECURITY.md` | Vulnerability reporting & security policy |
| ⬜ | `package.json` | Root workspace manifest (scripts, deps) |
| ⬜ | `pnpm-lock.yaml` | Dependency lockfile (deterministic installs) |
| ⬜ | `pnpm-workspace.yaml` | pnpm workspace package glob config |
| 🟦 | `tsconfig.base.json` | Shared TypeScript compiler options |
| 🟧 | `turbo.json` | Turborepo pipeline task definitions |

---

### 🔄 CI/CD Pipeline Map

```
 ┌────────────────────────────────────────────────────────────────────┐
 │                    🟧 GitHub Actions Pipelines                     │
 ├────────────────────────────────────────────────────────────────────┤
 │                                                                    │
 │  ci.yml (push to main / PRs)                                      │
 │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
 │  │ Checkout  │─▶│ pnpm     │─▶│ Lint +   │─▶│ Build +  │          │
 │  │ + Node 20 │  │ Install  │  │ Typecheck│  │ Test     │          │
 │  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │
 │                                                                    │
 │  deploy.yml (push to main / manual)                               │
 │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
 │  │ OIDC Auth│─▶│ Build    │─▶│ API →    │─▶│ Web →    │          │
 │  │ (no keys)│  │ Artifacts│  │ ECS      │  │ S3 + CDN │          │
 │  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │
 │                                                                    │
 │  Required Secrets: AWS_ACCOUNT_ID, AWS_REGION                     │
 └────────────────────────────────────────────────────────────────────┘
```

---

### 🛡️ Governance & Security

| Category | File | Owner |
|:---------|:-----|:------|
| 🟥 Code Review | `CODEOWNERS` | Auto-assign reviewers per path |
| 🟥 Security Disclosure | `SECURITY.md` | Responsible vulnerability reporting |
| 🟩 Contribution Rules | `CONTRIBUTING.md` | Branch naming, PR flow, commit conventions |
| 🟩 Licensing | `LICENSE` | MIT — permissive open source |

---

### 📊 Repository Stats

| Metric | Value |
|:-------|:------|
| **Primary Language** | TypeScript (54.8%) |
| **Infrastructure** | HCL / Terraform (42.0%) |
| **Containerization** | Dockerfile (2.6%) |
| **Markup** | HTML (0.6%) |
| **Package Manager** | pnpm (workspaces) |
| **Build Orchestrator** | Turborepo |
| **Runtime** | Node.js 20 |
| **Deploy Target** | AWS (ECS + S3 + CloudFront) |
| **Auth Model** | GitHub OIDC → AWS (zero static keys) |

---

<br/>

## 1. Overview

Every feature in the GMIIE codebase follows a three-layer contract pattern between the database and the UI:

```
Raw Data (Prisma) → Mapper Function → Canonical View-Model → UI Component
```

This document codifies the rules, file locations, and conventions that make the pattern work. **Every new page, component, or data query must follow this standard.**

---

## 2. The Three Layers

### Layer 1 — Raw Data (`@xxxiii/db` / Prisma)

Prisma queries live in **`src/lib/data.ts`**. Each query function:

- Uses `prisma.model.findMany()` / `findUnique()` with explicit `select` or `include` blocks.
- Never returns raw Prisma objects to the UI.
- Always maps results through a mapper function before returning.

### Layer 2 — Canonical View-Model Types (`src/lib/models.ts`)

Every shape that crosses the server→UI boundary has a **named TypeScript interface** in `models.ts`.

Rules:
| Rule | Rationale |
|---|---|
| One type per view boundary (card, detail page, panel) | Prevents leaking unused fields to the client |
| All dates are ISO strings (`string \| null`), never `Date` | Serialization-safe across React Server Components |
| Relations are pre-flattened — no Prisma join wrappers | Components don't need to know about `_count`, `.entity.name`, etc. |
| `_count` fields become `articleCount`, `timelineCount` | Clearer naming at the UI layer |
| Nullability matches what the mapper guarantees | No runtime surprises; if it can be null, the type says so |

### Layer 3 — Zod Runtime Schemas (`src/lib/schemas.ts`)

Every view-model type has a **corresponding Zod schema** that mirrors the TypeScript interface field-for-field. These schemas are used at the mapper boundary to validate data at runtime.

Rules:
| Rule | Rationale |
|---|---|
| Schema name = `<TypeName>Schema` (e.g., `EntityListItemSchema`) | Consistent naming convention |
| Enum schemas mirror Prisma enums exactly | Catches enum drift between schema changes and mappers |
| `safeNum` = `z.number().finite().nullable()` | Catches NaN/Infinity from bad math |
| `count` = `z.number().int().nonnegative()` | Counts can't be negative or fractional |
| `isoDateStr` = `z.string().datetime({ offset: true }).nullable()` | Validates ISO format |

---

## 3. Data Flow Contract

```
┌─────────────┐     ┌──────────────┐     ┌────────────────┐     ┌─────────────┐
│ Prisma Query │────▶│ Mapper (map) │────▶│ Zod Validation │────▶│ UI Component│
│  data.ts     │     │  data.ts     │     │  validate.ts   │     │  *.tsx       │
└─────────────┘     └──────────────┘     └────────────────┘     └─────────────┘
                                                │
                                         Dev: throw on fail
                                         Prod: warn + drop/passthrough
```

### Validation Behavior

| Environment | Single item (`validateOne`) | Array (`validateMany`) |
|---|---|---|
| **Development** | `console.error` + throw | Throw on first invalid item |
| **Production** | `console.warn` + passthrough as-is | Drop invalid items, return valid ones |

This ensures:
- **Dev:** Fail-fast. Schema drift, null relations, and enum changes surface immediately.
- **Prod:** Graceful degradation. A single bad row doesn't crash the whole page.

---

## 4. File Locations

```
apps/gmiie/src/lib/
├── models.ts        # Canonical view-model types (TypeScript interfaces)
├── schemas.ts       # Zod schemas mirroring models.ts
├── validate.ts      # validateOne / validateMany utilities
├── data.ts          # Prisma queries + mapper functions
└── __tests__/
    ├── schemas.contract.test.ts      # Contract tests (valid/invalid data)
    └── schemas.empty-states.test.ts  # Edge case tests (nulls, zeros, empty arrays)
```

---

## 5. Adding a New Feature — Checklist

When adding a new page or component that needs data:

- [ ] **Define the view-model type** in `models.ts` (one interface per view boundary)
- [ ] **Create the Zod schema** in `schemas.ts` (mirror the type field-for-field)
- [ ] **Write the Prisma query** in `data.ts` with explicit field selection
- [ ] **Write the mapper** in the same function — flatten relations, convert dates to ISO strings
- [ ] **Wrap the return** through `validateOne()` or `validateMany()`
- [ ] **Import the type** in your component from `@/lib/models` — never inline types
- [ ] **Add contract tests** in `__tests__/schemas.contract.test.ts` — valid data passes, invalid rejects
- [ ] **Add empty-state tests** in `__tests__/schemas.empty-states.test.ts` — null/zero/empty edge cases
- [ ] **Never use `as` casts** — if the type doesn't fit, fix the mapper

---

## 6. Anti-Patterns (Do Not)

| Anti-Pattern | Correct Approach |
|---|---|
| `as ArticleListItem` | Fix the mapper so the shape matches the type naturally |
| Inline types in components | Import from `models.ts` |
| Return raw Prisma objects from `data.ts` | Always map through a mapper function |
| `Date` objects in view-models | Convert to ISO string in the mapper: `d?.toISOString() ?? null` |
| Skip `_count` flattening | Map `_count.articles` → `articleCount` in the mapper |
| Add a schema without a test | Every schema needs ≥1 valid and ≥1 invalid test |
| Silence validation errors in dev | Fix the data, don't suppress the error |

---

## 7. Testing Standard

### Contract Tests (`schemas.contract.test.ts`)

For each schema, write at minimum:
1. **Valid full data** — all fields populated, passes validation
2. **Valid nullable data** — all nullable fields set to null, still passes
3. **Invalid field type** — wrong type on a required field, rejects
4. **Invalid enum value** — unrecognized enum, rejects
5. **Invalid number** — NaN/Infinity for numeric fields, rejects

### Empty-State Tests (`schemas.empty-states.test.ts`)

For each schema, cover:
1. **Zero counts** — `articleCount: 0` etc.
2. **Empty arrays** — `topics: []`, `entities: []`, `articles: []`
3. **Null optional relations** — `source: null`, `cluster: null`, `entity: null`
4. **Null descriptive fields** — `description: null`, `headline: null`

### Smoke Tests (`scripts/smoke-test.mjs`)

Automated HTTP health check that:
1. Builds the app (`next build`)
2. Starts a production server on an isolated port
3. Hits every static page + representative dynamic pages
4. Asserts all return HTTP 200–399
5. Exits non-zero if any route fails

---

## 8. CI Integration

```jsonc
// turbo.json tasks (relevant subset)
{
  "tasks": {
    "typecheck": {},          // tsc --noEmit
    "test": {},               // vitest run (contract + empty-state tests)
    "build": { "dependsOn": ["typecheck"] },
    // smoke runs post-build in CI pipeline
  }
}
```

The CI gate for any PR is:
1. `pnpm turbo typecheck` — compile-time correctness
2. `pnpm turbo test` — contract + empty-state schema validation
3. `pnpm turbo build` — production build
4. `pnpm --filter @xxxiii/gmiie smoke` — route-level health post-build

---

## 9. Rationale

This architecture exists because:

1. **Prisma types are too wide** — they include every possible join/include shape, which leaks implementation details into components.
2. **Runtime data is unpredictable** — null relations, missing joins, enum changes, and NaN from division-by-zero all happen in production.
3. **TypeScript is compile-time only** — it can't catch a null that Prisma didn't include in its select clause at runtime.
4. **Pages need flat, serializable shapes** — React Server Components serialize data across the wire; Date objects, circular references, and deep nesting all cause problems.
5. **Contract tests catch drift** — when someone adds a field to the Prisma schema but forgets to update the mapper, the Zod schema catches it.

The view-model contract pattern fills the gap between "compiles" and "works in production."
