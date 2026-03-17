# Diagrams Index

> **Status:** Complete · **Last Updated:** 2025-01

## Overview

XXXIII.IO documentation uses [Mermaid](https://mermaid.js.org/) diagrams rendered natively by GitHub. This page indexes all diagrams across the project documentation.

## Architecture Diagrams

| Diagram | Location | Type | Description |
|---------|----------|------|-------------|
| High-Level Architecture | [System Overview](../architecture/system-overview.md) | `graph TB` | End-to-end platform architecture |
| Data Flow Sequence | [System Overview](../architecture/system-overview.md) | `sequenceDiagram` | Source → Ingestion → AI → DB → App |
| Monorepo Dependency Graph | [Component Map](../architecture/component-map.md) | `graph TD` | Package and app dependencies |
| Service Boundaries | [Component Map](../architecture/component-map.md) | `graph LR` | External vs. internal service map |

## Security Diagrams

| Diagram | Location | Type | Description |
|---------|----------|------|-------------|
| Trust Boundaries | [Security Model](../security/security-model.md) | `graph TB` | Public / Authenticated / Internal zones |
| Service Isolation | [Security Model](../security/security-model.md) | `graph LR` | Network layer architecture |
| Threat Risk Matrix | [Threat Model](../security/threat-model.md) | `quadrantChart` | Impact vs. likelihood visualization |

## Operations Diagrams

| Diagram | Location | Type | Description |
|---------|----------|------|-------------|
| Deployment Architecture | [Deployment Guide](../operations/deployment-guide.md) | `graph TB` | Git → CI → Vercel → Production |
| Incident Response Flow | [Runbooks](../operations/runbooks.md) | `graph TD` | Detection → Resolution → Post-mortem |

## API Diagrams

| Diagram | Location | Type | Description |
|---------|----------|------|-------------|
| API Architecture | [API Overview](../api/overview.md) | `graph LR` | Client → Edge → Apps → Database |
| Authentication Flow | [API Overview](../api/overview.md) | `sequenceDiagram` | Browser → App → NextAuth → DB |

## Developer Diagrams

| Diagram | Location | Type | Description |
|---------|----------|------|-------------|
| Development Workflow | [Contributing](../developer/contributing.md) | `graph LR` | Branch → Code → Test → PR → Merge |

## Product Diagrams

| Diagram | Location | Type | Description |
|---------|----------|------|-------------|
| Product Roadmap Timeline | [Roadmap](../product/roadmap.md) | `gantt` | 9-phase Gantt chart |

## CI/CD Diagrams

| Diagram | Location | Type | Description |
|---------|----------|------|-------------|
| CI Pipeline Flow | [Workflows README](../../.github/workflows/README.md) | `graph LR` | Push → Lint → Type-check → Build → Test |

## README Diagrams

The main [README.md](../../README.md) contains additional Mermaid diagrams covering:
- System architecture overview
- Intelligence pipeline flow
- Signal scoring methodology
- Database entity relationships
- Deployment architecture
- AI engine prompt flow

## Creating New Diagrams

When adding Mermaid diagrams to documentation:

1. Use GitHub-supported Mermaid syntax (fenced code blocks with `mermaid` language)
2. Keep diagrams focused — one concept per diagram
3. Use consistent node naming across related diagrams
4. Add the diagram to this index
5. Test rendering on GitHub before merging
