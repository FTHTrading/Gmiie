# Applications

This directory contains the four consumer-facing Next.js 15 applications in the XXXIII.IO platform.

## Apps

| App | Port | Purpose | Auth |
|-----|------|---------|------|
| [hub/](hub/) | 3000 | Central dashboard — system health, content management | NextAuth.js (RBAC) |
| [gmiie/](gmiie/) | 3001 | Public financial intelligence feed — articles, signals, topics | Open (read-only) |
| [lps/](lps/) | 3002 | Landing pages and marketing — SEO-optimized static content | Open |
| [studio/](studio/) | 3003 | Editorial tool — content review, publishing, moderation | NextAuth.js (RBAC) |

## Shared Dependencies

All apps depend on shared packages from `packages/`:
- `@xxxiii/config` — ESLint, TypeScript, Tailwind presets
- `@xxxiii/ui` — Design system components
- `@xxxiii/types` — Shared types and Zod schemas

Hub, GMIIE, and Studio also depend on:
- `@xxxiii/db` — Prisma client and database access

GMIIE and LPS also depend on:
- `@xxxiii/seo` — Meta tag and structured data generation

## Running

```bash
# All apps
pnpm dev

# Specific app
pnpm --filter hub dev
pnpm --filter gmiie dev
pnpm --filter lps dev
pnpm --filter studio dev
```

## Architecture

All apps follow the [View-Model Contract](../docs/architecture/view-model-contract.md) pattern for data handling and use Next.js App Router with Server Components by default.
