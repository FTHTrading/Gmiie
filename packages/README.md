# Shared Packages

This directory contains the shared npm packages consumed by apps and services in the XXXIII.IO monorepo.

## Packages

| Package | Scope | Purpose |
|---------|-------|---------|
| [db/](db/) | `@xxxiii/db` | Prisma client, schema (478+ lines, 15+ models), migrations, seed scripts |
| [types/](types/) | `@xxxiii/types` | Shared TypeScript interfaces, Zod validation schemas, enums |
| [config/](config/) | `@xxxiii/config` | ESLint, TypeScript, Tailwind CSS, PostCSS shared configurations |
| [seo/](seo/) | `@xxxiii/seo` | Meta tag generation, Open Graph, sitemap, JSON-LD structured data |
| [ui/](ui/) | `@xxxiii/ui` | Design system components, primitives, theme tokens |

## Usage

Packages are referenced in app/service `package.json` files using workspace protocol:

```json
{
  "dependencies": {
    "@xxxiii/db": "workspace:*",
    "@xxxiii/types": "workspace:*",
    "@xxxiii/ui": "workspace:*"
  }
}
```

## Development

```bash
# Build all packages
pnpm turbo build --filter='./packages/*'

# Type-check all packages
pnpm turbo type-check --filter='./packages/*'

# Run tests for a specific package
pnpm --filter @xxxiii/types test
```

## Adding a New Package

1. Create directory under `packages/`
2. Add `package.json` with scoped name (`@xxxiii/new-package`)
3. Add to `pnpm-workspace.yaml` (if not using glob)
4. Reference from consuming apps via `workspace:*`
5. Update [CODEOWNERS](../CODEOWNERS) if ownership differs
