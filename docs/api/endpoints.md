# API Endpoints — XXXIII.IO

> Status: ✅ Complete
>
> For full request/response examples with payloads, see [api.md](../api.md).

---

## Health

| Method | Endpoint | Auth | Description |
|:-------|:---------|:-----|:------------|
| GET | `/health` | None | Service health, DB latency, audit count |

---

## Articles

| Method | Endpoint | Auth | Description |
|:-------|:---------|:-----|:------------|
| GET | `/articles` | API key | List articles with filtering and pagination |
| GET | `/articles/:slug` | API key | Get article by slug |
| GET | `/articles/:id` | API key | Get article by ID |

### Query Parameters (List)

| Parameter | Type | Default | Description |
|:----------|:-----|:--------|:------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max 100) |
| `topic` | string | — | Filter by topic slug |
| `cluster` | string | — | Filter by topic cluster |
| `entity` | string | — | Filter by entity slug |
| `type` | string | — | Article type: `BRIEF`, `ANALYSIS`, `DEEP_DIVE` |
| `tier` | string | — | Source tier: `TIER_1`, `TIER_2`, `TIER_3`, `TIER_4` |
| `minScore` | number | — | Minimum overall signal score |
| `since` | ISO 8601 | — | Published after this date |
| `sort` | string | `publishedAt` | Sort field |
| `order` | string | `desc` | Sort order: `asc`, `desc` |

---

## Entities

| Method | Endpoint | Auth | Description |
|:-------|:---------|:-----|:------------|
| GET | `/entities` | API key | List entities with filtering |
| GET | `/entities/:slug` | API key | Get entity by slug |

### Query Parameters (List)

| Parameter | Type | Default | Description |
|:----------|:-----|:--------|:------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page |
| `type` | string | — | Entity type: `INSTITUTION`, `REGULATOR`, `PROTOCOL`, `PERSON` |
| `country` | string | — | Filter by country code |

---

## Topics

| Method | Endpoint | Auth | Description |
|:-------|:---------|:-----|:------------|
| GET | `/topics` | API key | List all topics with clusters |
| GET | `/topics/:slug` | API key | Get topic with recent articles |

---

## Signals

| Method | Endpoint | Auth | Description |
|:-------|:---------|:-----|:------------|
| GET | `/signals` | API key | Aggregate signal scores |
| GET | `/signals/composite` | API key | GMIIE Composite Index (30-day rolling) |
| GET | `/articles/:id/signal` | API key | Signal scores for a specific article |

---

## Sources

| Method | Endpoint | Auth | Description |
|:-------|:---------|:-----|:------------|
| GET | `/sources` | API key | List configured sources |
| GET | `/sources/:id` | Admin key | Source details + feed config |

---

## Timeline

| Method | Endpoint | Auth | Description |
|:-------|:---------|:-----|:------------|
| GET | `/entities/:slug/timeline` | API key | Timeline events for an entity |
| GET | `/timeline` | API key | Global timeline (all entities) |

---

## Tags

| Method | Endpoint | Auth | Description |
|:-------|:---------|:-----|:------------|
| GET | `/tags` | API key | List all tags with article counts |

---

## Admin Endpoints

> Requires Admin API key.

| Method | Endpoint | Auth | Description |
|:-------|:---------|:-----|:------------|
| GET | `/admin/audit` | Admin | Browse audit log entries |
| GET | `/admin/jobs` | Admin | Pipeline job status and history |
| POST | `/admin/ingest` | Admin | Trigger manual ingestion run |
| POST | `/admin/publish/:id` | Admin | Manually publish an article |

---

## Pagination

All list endpoints support pagination:

```
GET /articles?page=2&limit=10
```

Response includes pagination metadata:

```json
{
  "meta": {
    "page": 2,
    "limit": 10,
    "total": 47,
    "totalPages": 5
  }
}
```

---

## Filtering Conventions

- Multiple values: comma-separated (e.g., `type=BRIEF,ANALYSIS`)
- Date ranges: `since` and `until` parameters (ISO 8601)
- Sorting: `sort=fieldName&order=asc|desc`
- Minimum thresholds: `minScore=7.0`

---

## Related Documents

- [API Overview](overview.md) — Authentication, versioning, error codes
- [Detailed API Reference](../api.md) — Full request/response examples
