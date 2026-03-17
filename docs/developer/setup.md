# Developer Setup Guide

> **Status:** Complete · **Last Updated:** 2025-01

## Prerequisites

| Tool | Version | Installation |
|------|---------|-------------|
| Node.js | 20+ | [nodejs.org](https://nodejs.org) |
| pnpm | 9.15+ | `corepack enable && corepack prepare pnpm@latest --activate` |
| Python | 3.12 | [python.org](https://python.org) |
| Docker | Latest | [docker.com](https://docker.com) (optional, for Redis/PostgreSQL) |
| Git | Latest | [git-scm.com](https://git-scm.com) |

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/FTHTrading/Gmiie.git
cd Gmiie

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your local values (see Environment Variables below)

# 4. Set up the database
cd packages/db
pnpm prisma generate
pnpm prisma migrate dev
cd ../..

# 5. Start all apps in development
pnpm dev
```

## Environment Variables

Create a `.env` file in the project root:

```env
# Database (Neon or local PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/xxxiii?schema=public"
DIRECT_URL="postgresql://user:password@localhost:5432/xxxiii?schema=public"

# Authentication (Hub & Studio)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# AI Engine
OPENAI_API_KEY="sk-..."

# Queue System
REDIS_URL="redis://localhost:6379"
```

> **Note:** Never commit `.env` files. They are excluded via `.gitignore`.

## Development Commands

### Monorepo (root)

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps in development mode |
| `pnpm build` | Build all apps and packages |
| `pnpm lint` | Lint all packages |
| `pnpm type-check` | TypeScript type checking across monorepo |
| `pnpm test` | Run all tests (Vitest) |
| `pnpm clean` | Clean all build artifacts |

### App-Specific

```bash
# Run a specific app
pnpm --filter hub dev          # Hub on :3000
pnpm --filter gmiie dev        # GMIIE on :3001
pnpm --filter lps dev          # LPS on :3002
pnpm --filter studio dev       # Studio on :3003
```

### Database

```bash
cd packages/db

pnpm prisma generate           # Generate Prisma client
pnpm prisma migrate dev        # Create and apply migration
pnpm prisma migrate deploy     # Apply pending migrations
pnpm prisma studio             # Open Prisma Studio (GUI)
pnpm prisma db seed             # Run seed scripts
```

### Services

```bash
# Python Ingestion Service
cd services/ingestion
python -m venv venv
source venv/bin/activate       # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python main.py

# AI Engine
cd services/ai-engine
pnpm dev

# Queue Workers
cd services/queue
pnpm dev
```

## Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm --filter @xxxiii/types test

# Run tests in watch mode
pnpm test -- --watch

# Run specific test file
pnpm vitest run path/to/test.ts
```

### Test Categories

| Type | Purpose | Location |
|------|---------|----------|
| Contract Tests | Validate Zod schemas against data | `**/tests/contract/` |
| Empty-State Tests | Verify empty data handling | `**/tests/empty-state/` |
| Smoke Tests | Basic endpoint/component checks | `**/tests/smoke/` |
| Unit Tests | Function-level logic | `**/tests/unit/` |

## IDE Setup

### VS Code (Recommended)

Recommended extensions:
- **ESLint** — Linting
- **Prettier** — Formatting
- **Prisma** — Schema syntax highlighting
- **Tailwind CSS IntelliSense** — Class autocomplete
- **Python** — Python language support

### Settings

The repo includes shared VS Code settings. Key configurations:
- Format on save enabled
- ESLint auto-fix on save
- Tailwind CSS class sorting

## Debugging

### Next.js Apps

1. Use the built-in Next.js debugger or attach VS Code debugger
2. Add `debugger;` statements or use VS Code breakpoints
3. Server components: Check terminal output
4. Client components: Use browser DevTools

### Services

```bash
# Debug Node.js services with inspector
node --inspect services/ai-engine/src/index.ts

# Debug Python ingestion service
python -m debugpy --listen 5678 main.py
```

### Database

```bash
# Open Prisma Studio for data inspection
cd packages/db
pnpm prisma studio
```

## Troubleshooting

| Issue | Solution |
|-------|---------|
| `pnpm install` fails | Delete `node_modules` and `pnpm-lock.yaml`, run `pnpm install` |
| Prisma client errors | Run `pnpm prisma generate` in `packages/db` |
| Port already in use | Kill process: `lsof -ti:3000 \| xargs kill` (macOS/Linux) |
| Type errors after schema change | Run `pnpm prisma generate` then `pnpm type-check` |
| Redis connection refused | Start Redis: `docker run -p 6379:6379 redis` |
| Python venv issues | Delete and recreate: `rm -rf venv && python -m venv venv` |

## Cross-References

- [Project Structure](project-structure.md) — Monorepo file layout
- [Contributing](contributing.md) — Code standards and PR process
- [CONTRIBUTING.md](../../CONTRIBUTING.md) — Top-level contribution guide
