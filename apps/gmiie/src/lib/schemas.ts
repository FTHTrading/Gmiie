// ═══════════════════════════════════════════════════════════════
// GMIIE — Zod Runtime Validation Schemas
// Mirror the canonical view-model types in models.ts.
// Used at mapper boundaries in data.ts to catch runtime data
// issues (null relations, enum drift, malformed dates, etc.)
// before they reach the UI as ghost bugs.
// ═══════════════════════════════════════════════════════════════

import { z } from "zod";

// ─── Helpers ─────────────────────────────────────────────────

/** ISO-8601 date string or null */
const isoDateStr = z.string().datetime({ offset: true }).nullable();

/** Finite number or null (catches NaN / Infinity from bad math) */
const safeNum = z.number().finite().nullable();

/** Non-negative integer (for counts) */
const count = z.number().int().nonnegative();

// ─── ArticleType / EntityType / ArticleStatus enums ────────
// Keep these in sync with the Prisma schema.

export const ArticleTypeEnum = z.enum([
  "BRIEF",
  "DAILY_DIGEST",
  "WEEKLY_ROUNDUP",
  "EXECUTIVE_SUMMARY",
  "DEEP_DIVE",
  "INFRA_ANALYSIS",
  "ENTITY_UPDATE",
  "MARKET_MAP",
  "STRATEGIC_MEMO",
  "RESEARCH_ARTICLE",
  "PARTNER_SPOTLIGHT",
  "WHITEPAPER",
  "REGULATOR_TRACKER",
  "REPORT",
]);

export const ArticleStatusEnum = z.enum([
  "INGESTED",
  "PROCESSING",
  "DRAFT",
  "REVIEW",
  "APPROVED",
  "PUBLISHED",
  "ARCHIVED",
  "REJECTED",
]);

export const EntityTypeEnum = z.enum([
  "BANK",
  "CENTRAL_BANK",
  "REGULATOR",
  "EXCHANGE",
  "CUSTODIAN",
  "ASSET_MANAGER",
  "TOKENIZATION_FIRM",
  "INFRASTRUCTURE_PROVIDER",
  "CHAIN",
  "PROTOCOL",
  "COUNTRY",
  "MARKET_UTILITY",
  "FUND",
  "BROKER_DEALER",
  "TRANSFER_AGENT",
  "CLEARING_HOUSE",
  "PAYMENT_PROVIDER",
  "GOVERNMENT_AGENCY",
]);

// ─── Shared Fragments ───────────────────────────────────────

export const NameSlugSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
});

export const SignalSnapshotSchema = z.object({
  institutionalAdoption: safeNum,
  regulatoryClarity: safeNum,
  infrastructureMaturity: safeNum,
  overallScore: safeNum,
});

export const SignalFullSchema = SignalSnapshotSchema.extend({
  marketReadiness: safeNum,
  settlementImpact: safeNum,
  complianceIntensity: safeNum,
  crossBorderRelevance: safeNum,
  liquiditySignificance: safeNum,
  strategicUrgency: safeNum,
});

// ─── Article Schemas ────────────────────────────────────────

export const ArticleListItemSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  headline: z.string().nullable(),
  executiveSummary: z.string().nullable(),
  articleType: ArticleTypeEnum,
  publishedAt: isoDateStr,
  importanceScore: safeNum,
  confidenceScore: safeNum,
  source: z.object({ name: z.string(), credibilityTier: z.string() }).nullable(),
  topics: z.array(NameSlugSchema),
  entities: z.array(NameSlugSchema),
  signal: SignalSnapshotSchema.nullable(),
});

export const ArticleDetailSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  headline: z.string().nullable(),
  dek: z.string().nullable(),
  executiveSummary: z.string().nullable(),
  content: z.string(),
  whyItMatters: z.string().nullable(),
  whatHappened: z.string().nullable(),
  marketImplications: z.string().nullable(),
  infraImplications: z.string().nullable(),
  regulatoryImplications: z.string().nullable(),
  articleType: ArticleTypeEnum,
  status: ArticleStatusEnum,
  assetClass: z.string().nullable(),
  region: z.string().nullable(),
  importanceScore: safeNum,
  confidenceScore: safeNum,
  sentimentScore: safeNum,
  publishedAt: isoDateStr,
  sourcePublishedAt: isoDateStr,
  updatedAt: isoDateStr,
  sourceUrl: z.string().url().nullable(),
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  source: z
    .object({ name: z.string(), slug: z.string(), credibilityTier: z.string() })
    .nullable(),
  author: z
    .object({ name: z.string(), slug: z.string(), isAI: z.boolean() })
    .nullable(),
  topics: z.array(
    z.object({
      name: z.string(),
      slug: z.string(),
      relevance: z.number().nullable(),
    }),
  ),
  entities: z.array(
    z.object({
      name: z.string(),
      slug: z.string(),
      entityType: z.string(),
      headquarters: z.string().nullable(),
      role: z.string().nullable(),
    }),
  ),
  signal: SignalFullSchema.nullable(),
  tags: z.array(NameSlugSchema),
});

// ─── Entity Schemas ─────────────────────────────────────────

export const EntityListItemSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  shortName: z.string().nullable(),
  entityType: EntityTypeEnum,
  description: z.string().nullable(),
  headquarters: z.string().nullable(),
  country: z.string().nullable(),
  articleCount: count,
  timelineCount: count,
});

export const EntityDetailSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  shortName: z.string().nullable(),
  entityType: EntityTypeEnum,
  description: z.string().nullable(),
  longDescription: z.string().nullable(),
  whyItMatters: z.string().nullable(),
  strategicRole: z.string().nullable(),
  website: z.string().nullable(),
  headquarters: z.string().nullable(),
  country: z.string().nullable(),
  region: z.string().nullable(),
  founded: z.string().nullable(),
  articleCount: count,
  timelineCount: count,
  articles: z.array(ArticleListItemSchema),
  topics: z.array(NameSlugSchema),
  timeline: z.array(z.lazy(() => TimelineEventSchema)),
});

// ─── Topic Schemas ──────────────────────────────────────────

export const TopicListItemSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable(),
  clusterSlug: z.string().nullable(),
  clusterName: z.string().nullable(),
  articleCount: count,
});

export const TopicDetailSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable(),
  longDescription: z.string().nullable(),
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  cluster: z
    .object({
      name: z.string(),
      slug: z.string(),
      description: z.string().nullable(),
    })
    .nullable(),
  articleCount: count,
  articles: z.array(ArticleListItemSchema),
  entities: z.array(
    z.object({
      name: z.string(),
      slug: z.string(),
      entityType: z.string(),
      description: z.string().nullable(),
      articleCount: count,
    }),
  ),
});

export const TopicClusterItemSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable(),
  topics: z.array(
    z.object({
      name: z.string(),
      slug: z.string(),
      articleCount: count,
    }),
  ),
  topicCount: count,
});

// ─── Regulator Schema ───────────────────────────────────────

export const RegulatorListItemSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  shortName: z.string().nullable(),
  entityType: EntityTypeEnum,
  description: z.string().nullable(),
  headquarters: z.string().nullable(),
  country: z.string().nullable(),
  region: z.string().nullable(),
  articleCount: count,
  timelineCount: count,
});

// ─── Signal Schemas ─────────────────────────────────────────

export const SignalDimensionSchema = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  score: z.number().finite(),
});

export const CompositeIndexSchema = z.object({
  score: z.number().finite(),
  sampleSize: count,
  dimensions: z.array(
    z.object({
      label: z.string(),
      score: z.number().finite(),
      weight: z.number().positive(),
    }),
  ),
});

// ─── Trending Schemas ───────────────────────────────────────

export const TrendingTopicItemSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  count: count,
});

export const TrendingEntityItemSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  type: z.string(),
  count: count,
});

// ─── Timeline Schema ────────────────────────────────────────

export const TimelineEventSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable(),
  date: z.string().datetime({ offset: true }),
  sourceUrl: z.string().nullable(),
  entity: z
    .object({
      name: z.string(),
      slug: z.string(),
      shortName: z.string().nullable(),
      entityType: z.string(),
    })
    .nullable(),
});

// ─── Dashboard Counts ───────────────────────────────────────

export const DashboardCountsSchema = z.object({
  articles: count,
  entities: count,
  topics: count,
  sources: count,
});

// ─── State Stablecoin Tracker Schemas ───────────────────────

export const BillUpdateItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable(),
  status: z.string().nullable(),
  date: z.string().datetime({ offset: true }),
  sourceUrl: z.string().nullable(),
});

export const BillListItemSchema = z.object({
  id: z.string().min(1),
  billNumber: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().nullable(),
  whatChanged: z.string().nullable(),
  whyItMatters: z.string().nullable(),
  status: z.string().min(1),
  chamber: z.string().nullable(),
  sponsorName: z.string().nullable(),
  sourceUrl: z.string().nullable(),
  confidenceScore: z.number().nullable(),
  credibilityTier: z.string().min(1),
  introducedDate: z.string().nullable(),
  lastActionDate: z.string().nullable(),
  updates: z.array(BillUpdateItemSchema),
});

export const StateTrackerListItemSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  abbreviation: z.string().min(1),
  status: z.string().min(1),
  summary: z.string().nullable(),
  whyItMatters: z.string().nullable(),
  nextExpectedStep: z.string().nullable(),
  lastActionDate: z.string().nullable(),
  billCount: count,
  latestBillStatus: z.string().nullable(),
});

export const StateTrackerDetailSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  abbreviation: z.string().min(1),
  status: z.string().min(1),
  summary: z.string().nullable(),
  whyItMatters: z.string().nullable(),
  nextExpectedStep: z.string().nullable(),
  lastActionDate: z.string().nullable(),
  bills: z.array(BillListItemSchema),
  updates: z.array(z.object({
    id: z.string().min(1),
    title: z.string().min(1),
    description: z.string().nullable(),
    category: z.string().nullable(),
    date: z.string().datetime({ offset: true }),
    sourceUrl: z.string().nullable(),
  })),
});
