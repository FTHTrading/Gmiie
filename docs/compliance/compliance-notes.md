# Compliance & Governance Notes

> **Status:** Active · **Last Updated:** 2025-01

## Overview

This document captures governance practices, data handling policies, and compliance considerations for the XXXIII.IO platform. As a financial intelligence aggregation platform, XXXIII.IO processes publicly available information and does not handle regulated financial transactions.

## Data Classification

| Classification | Description | Examples | Handling |
|---------------|-------------|----------|----------|
| **Public** | Published content from public sources | Articles, topics, entities | Open access, cached, indexed |
| **Internal** | Platform operational data | Queue jobs, audit logs, system metrics | Access restricted to team members |
| **Confidential** | Authentication and access credentials | API keys, session tokens, passwords | Encrypted storage, no logging |
| **Restricted** | N/A — platform does not handle PII at scale | — | — |

## Data Handling Practices

### Content Sourcing
- All ingested content comes from **publicly available sources** (RSS feeds, public web pages, public APIs)
- Source attribution is maintained for all content
- Content is classified by **source credibility tier** (Tier 1–4)
- No paywalled or restricted content is scraped

### User Data
- User accounts exist only for **editorial staff** (Studio/Hub access)
- Authentication managed by NextAuth.js (session-based, no password storage for OAuth)
- Minimal PII collected: email, name, role
- No consumer user accounts or tracking

### AI Processing
- Content processed through OpenAI GPT-4o API
- Data sent to OpenAI is limited to article text for classification/scoring
- No PII is sent to AI services
- OpenAI data usage policy applies (API data not used for training)

## Access Control

| Resource | Access Model | Documentation |
|----------|-------------|---------------|
| Source code | Private GitHub repository | [CODEOWNERS](../../CODEOWNERS) |
| Production database | Neon managed access, team credentials only | [Security Model](../security/security-model.md) |
| API keys | Vercel encrypted environment variables | [Deployment Guide](../operations/deployment-guide.md) |
| CI/CD | GitHub Actions, team-restricted | [Workflows](../../.github/workflows/README.md) |
| Deployment | Vercel, team-restricted | [Deployment Guide](../operations/deployment-guide.md) |

## Audit Trail

| Event | Captured In | Retention |
|-------|------------|-----------|
| User actions (Studio) | AuditLog model (PostgreSQL) | Indefinite |
| Queue job results | QueueJob model (PostgreSQL) | Indefinite |
| Deployment history | Vercel dashboard | Platform retention |
| Code changes | Git history (GitHub) | Indefinite |
| CI/CD runs | GitHub Actions logs | 90 days |

## Dependency Governance

| Practice | Implementation |
|----------|---------------|
| Dependency alerts | Dependabot enabled |
| Lock file integrity | pnpm-lock.yaml committed |
| License compliance | Review on addition of new dependency |
| Update cadence | Monthly dependency review |
| Python dependencies | requirements.txt pinned versions |

## Regulatory Considerations

| Area | Status | Notes |
|------|--------|-------|
| GDPR | Low exposure | No consumer PII collected; editorial staff only |
| CCPA | Low exposure | No consumer data processing |
| Financial regulations (SEC, FINRA) | N/A | Platform aggregates public information; does not provide financial advice |
| Copyright / Fair Use | Active consideration | Content attribution maintained; AI summarization of public information |
| AI transparency | Best practice | AI-generated content labeled; no deceptive AI use |

## Open Compliance Items

| Item | Priority | Status | Notes |
|------|----------|--------|-------|
| Formalize data retention policy | P2 | Planned | Define retention periods for each data class |
| Add cookie consent for public apps | P3 | Planned | GMIIE and LPS analytics cookies |
| Document AI content labeling policy | P2 | Planned | Standardize AI-generated content attribution |
| Conduct dependency license audit | P3 | Planned | Ensure no GPL-incompatible licenses |
| Implement data deletion procedure | P3 | Deferred | For editorial user account removal |

## Cross-References

- [Security Model](../security/security-model.md) — Technical security controls
- [Threat Model](../security/threat-model.md) — Risk analysis
- [SECURITY.md](../../SECURITY.md) — Vulnerability reporting
