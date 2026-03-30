# Scripts — XXXIII.IO

Root-level scripts for orchestration and automation.

## Files

| Script | Description |
|:-------|:------------|
| `orchestrator.mjs` | Multi-service orchestrator — starts apps and pipeline services in correct order |

## Usage

Scripts are typically invoked through root `package.json` commands:

```bash
pnpm dev        # Start all apps via Turborepo
pnpm pipeline   # Start ingestion + queue services
pnpm launch     # Start everything
```
