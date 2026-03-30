# Data — XXXIII.IO

Seed data, configurations, and taxonomy definitions used by the intelligence pipeline.

## Structure

| Directory | Description |
|:----------|:------------|
| `entity-seeds/` | Seed data for organizations, regulators, protocols |
| `sources/` | RSS feed and scraping source configurations with credibility tiers |
| `taxonomy/` | Topic taxonomy definitions and hierarchies |
| `topic-clusters/` | Topic cluster mappings for content grouping |

## Usage

Seed data is loaded via:

```bash
pnpm db:seed
```

Source and taxonomy configurations are consumed by the ingestion and classification services at runtime.
