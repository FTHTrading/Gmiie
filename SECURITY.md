# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| main    | ✅ Active  |
| < main  | ❌ None    |

## Reporting a Vulnerability

**Do not open a public issue for security vulnerabilities.**

If you discover a security vulnerability in any XXXIII.IO component, please report it responsibly:

1. **Email**: [security@xxxiii.io](mailto:security@xxxiii.io)
2. **Subject**: `[SECURITY] Brief description`
3. **Include**:
   - Component affected (app, package, service)
   - Steps to reproduce
   - Potential impact assessment
   - Suggested fix (if applicable)

### Response Timeline

| Stage | Target |
|-------|--------|
| Acknowledgement | 24 hours |
| Initial triage | 72 hours |
| Fix development | 7–14 days (severity-dependent) |
| Disclosure | Coordinated after patch |

### Scope

The following components are in scope:

- **Applications**: Hub, GMIIE, LPS, Studio
- **Packages**: `@xxxiii/db`, `@xxxiii/types`, `@xxxiii/config`, `@xxxiii/seo`, `@xxxiii/ui`
- **Services**: Ingestion pipeline, AI engine, queue workers
- **Infrastructure**: Docker configurations, deployment scripts, CI/CD workflows

### Out of Scope

- Third-party dependencies (report upstream, notify us)
- Social engineering attacks against XXXIII personnel
- Denial-of-service attacks against production infrastructure

## Security Architecture

### Authentication & Authorization

| Surface | Method | Access Control |
|---------|--------|----------------|
| Studio (CMS) | NextAuth.js | Role-based: `ADMIN`, `EDITOR`, `ANALYST`, `VIEWER` |
| Public Apps | None required | Open read access |
| Internal Services | Network isolation | No public exposure |
| Ingestion API | Bearer token | Service-to-service only |
| Revalidation API | Bearer token | Pipeline-triggered |

### Data Protection

- **Database**: PostgreSQL (Neon) with TLS, connection pooling via Prisma
- **Secrets**: Environment variable isolation per deployment target
- **Input validation**: Zod schemas at every service boundary
- **SQL injection**: Prevented by Prisma parameterized queries
- **XSS**: HTML sanitized via `sanitize-html` with allowlisted tags
- **External links**: Enforced `rel="noopener noreferrer nofollow"`
- **Content integrity**: xxhash deduplication, immutable article history

### Audit & Observability

- All editorial actions logged to `AuditLog` (append-only)
- Pipeline execution tracked via `JobLog`
- Structured JSON logging across all services (structlog for Python, console for Node.js)

### Dependency Management

- Dependabot / Renovate recommended for automated updates
- `pnpm audit` for Node.js vulnerability scanning
- `pip-audit` for Python dependency scanning
- Lock files committed (`pnpm-lock.yaml`, `requirements.txt`)

## Security Checklist

Before any production deployment, verify:

- [ ] All environment variables are set and secrets are not committed
- [ ] `.env` is in `.gitignore`
- [ ] `REVALIDATION_TOKEN` is set and unique per environment
- [ ] Database connection uses TLS
- [ ] Redis connection uses TLS in production
- [ ] Studio authentication is configured with secure session secrets
- [ ] CORS origins are restricted to known domains
- [ ] Rate limiting is enabled on public API routes
- [ ] Health check endpoints do not expose sensitive information
