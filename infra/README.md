# Infrastructure

This directory contains infrastructure configuration and setup scripts for the XXXIII.IO platform.

## Contents

| Path | Purpose |
|------|---------|
| [scripts/setup.sh](scripts/setup.sh) | Initial infrastructure setup script |

## Infrastructure Overview

| Component | Provider | Purpose |
|-----------|----------|---------|
| Application hosting | Vercel | Next.js app deployment (4 apps) |
| Database | Neon | Managed PostgreSQL with branching |
| Queue/Cache | Redis | BullMQ job processing |
| DNS / SSL | Cloudflare | Domain management, SSL termination, DDoS protection |
| CI/CD | GitHub Actions | Lint, type-check, build, test pipeline |
| Source control | GitHub | Private repository (FTHTrading/Gmiie) |

## Deployment

See [Deployment Guide](../docs/operations/deployment-guide.md) for full deployment procedures, environment promotion, and rollback instructions.
