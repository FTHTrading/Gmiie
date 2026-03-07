# XXXIII.IO — API Reference

## Overview

The XXXIII API provides programmatic access to the intelligence platform. All endpoints return JSON and follow REST conventions.

**Base URL**: `https://api.xxxiii.io/v1`

---

## Authentication

```
Authorization: Bearer <api_key>
```

API keys are managed through the Studio admin dashboard at `studio.xxxiii.io/settings`.

---

## Endpoints

### Articles

#### List Articles

```
GET /articles
```

**Query Parameters**:

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number |
| `limit` | integer | 20 | Items per page (max 100) |
| `topic` | string | — | Filter by topic slug |
| `cluster` | string | — | Filter by topic cluster |
| `entity` | string | — | Filter by entity slug |
| `type` | string | — | Article type (BRIEF, ANALYSIS, DEEP_DIVE, etc.) |
| `tier` | string | — | Source credibility tier (TIER_1, TIER_2, etc.) |
| `minScore` | number | — | Minimum overall signal score |
| `since` | ISO 8601 | — | Articles published after this date |
| `sort` | string | `publishedAt` | Sort field (publishedAt, overallScore, title) |
| `order` | string | `desc` | Sort order (asc, desc) |

**Response**:

```json
{
  "data": [
    {
      "id": "clx...",
      "title": "Federal Reserve Finalizes Tokenized Deposit Guidelines",
      "seoTitle": "Fed Tokenized Deposit Guidelines 2024 | GMIIE",
      "slug": "federal-reserve-tokenized-deposit-guidelines",
      "summary": "...",
      "body": "...",
      "type": "ANALYSIS",
      "status": "PUBLISHED",
      "primaryTopic": "tokenized-deposits",
      "secondaryTopics": ["cbdc", "banking-regulation"],
      "credibilityTier": "TIER_1",
      "source": { "name": "Federal Reserve", "url": "...", "tier": "TIER_1" },
      "overallScore": 8.7,
      "signalScores": {
        "regulatoryImpact": 9.2,
        "marketSignificance": 8.5,
        "institutionalRelevance": 9.0,
        "infrastructureDevelopment": 7.8,
        "narrativeInfluence": 8.0,
        "geopoliticalRelevance": 7.5,
        "innovationSignal": 8.2,
        "riskFactor": 6.8,
        "temporalUrgency": 9.5
      },
      "entities": [
        { "name": "Federal Reserve", "type": "CENTRAL_BANK", "slug": "federal-reserve" }
      ],
      "readTime": 5,
      "publishedAt": "2024-03-15T14:30:00Z",
      "url": "https://gmiie.xxxiii.io/intelligence/federal-reserve-tokenized-deposit-guidelines"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1247,
    "totalPages": 63
  }
}
```

#### Get Article

```
GET /articles/:slug
```

Returns a single article with full body content and metadata.

---

### Topics

#### List Topics

```
GET /topics
```

Returns all 20 topics grouped by their 8 clusters.

#### Get Topic

```
GET /topics/:slug
```

Returns topic details with recent articles, related entities, and signal trends.

---

### Entities

#### List Entities

```
GET /entities
```

**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `type` | string | Entity type filter (CENTRAL_BANK, REGULATOR, EXCHANGE, etc.) |
| `q` | string | Search query |
| `limit` | integer | Items per page |

#### Get Entity

```
GET /entities/:slug
```

Returns entity profile with description, key facts, recent coverage, timeline, and related entities.

---

### Signals

#### Signal Dashboard

```
GET /signals/dashboard
```

Returns aggregate signal scores across all dimensions, with trends and top movers.

#### Signal Feed

```
GET /signals/feed
```

Returns real-time signal events, sorted by temporal urgency.

---

### Search

#### Full-text Search

```
GET /search
```

**Query Parameters**:

| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Search query (required) |
| `type` | string | Filter: articles, entities, topics |
| `limit` | integer | Results per page |

Powered by Meilisearch for sub-50ms responses.

---

### Feeds

#### RSS Feed

```
GET /feed/rss
```

Returns RSS 2.0 XML feed of latest published articles.

#### JSON Feed

```
GET /feed/json
```

Returns JSON Feed 1.1 format.

---

## Rate Limits

| Plan | Requests/hour | Requests/day |
|------|--------------|-------------|
| Free | 100 | 1,000 |
| Pro | 1,000 | 10,000 |
| Enterprise | 10,000 | Unlimited |

Rate limit headers included in all responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 997
X-RateLimit-Reset: 1710518400
```

---

## Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `unauthorized` | 401 | Missing or invalid API key |
| `forbidden` | 403 | Insufficient permissions |
| `not_found` | 404 | Resource not found |
| `rate_limited` | 429 | Rate limit exceeded |
| `server_error` | 500 | Internal server error |

```json
{
  "error": {
    "code": "not_found",
    "message": "Article not found",
    "status": 404
  }
}
```

---

## Webhooks

Enterprise plans can configure webhooks for real-time notifications:

| Event | Description |
|-------|-------------|
| `article.published` | New article published |
| `signal.high_urgency` | High-urgency signal detected (score ≥ 9) |
| `entity.updated` | Entity profile updated |
| `digest.compiled` | Daily/weekly digest ready |

---

*API documentation is auto-generated from the codebase. Last updated with the latest build.*
