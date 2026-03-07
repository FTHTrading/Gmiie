// ═══════════════════════════════════════════════════════════════
// GMIIE — Mapper Contract Tests
// Verify that Zod schemas accept well-formed view-model data and
// reject malformed data. These act as snapshot-style contract
// tests that catch quiet field drift without hitting the DB.
// ═══════════════════════════════════════════════════════════════

import { describe, it, expect } from "vitest";
import {
  ArticleListItemSchema,
  ArticleDetailSchema,
  EntityListItemSchema,
  EntityDetailSchema,
  TopicListItemSchema,
  TopicDetailSchema,
  TopicClusterItemSchema,
  RegulatorListItemSchema,
  SignalDimensionSchema,
  CompositeIndexSchema,
  TrendingTopicItemSchema,
  TrendingEntityItemSchema,
  TimelineEventSchema,
  DashboardCountsSchema,
} from "@/lib/schemas";

// ─── Fixtures ────────────────────────────────────────────────

const NOW = "2025-01-15T12:00:00.000Z";

const nameSlug = { name: "Tokenized Funds", slug: "tokenized-funds" };

const signalSnapshot = {
  institutionalAdoption: 0.82,
  regulatoryClarity: 0.65,
  infrastructureMaturity: 0.71,
  overallScore: 0.73,
};

const signalFull = {
  ...signalSnapshot,
  marketReadiness: 0.68,
  settlementImpact: 0.55,
  complianceIntensity: 0.62,
  crossBorderRelevance: 0.48,
  liquiditySignificance: 0.59,
  strategicUrgency: 0.77,
};

const articleListItem = {
  slug: "test-article",
  title: "Test Article About Tokenization",
  headline: "Breaking: tokenization surges",
  executiveSummary: "Summary of the article",
  articleType: "BRIEF" as const,
  publishedAt: NOW,
  importanceScore: 0.85,
  source: { name: "Reuters" },
  topics: [nameSlug],
  entities: [{ name: "JPMorgan", slug: "jpmorgan-chase" }],
  signal: signalSnapshot,
};

const timelineEvent = {
  id: "evt-001",
  title: "Launch Event",
  description: "Description of the event",
  date: NOW,
  sourceUrl: "https://example.com/event",
  entity: {
    name: "JPMorgan Chase",
    slug: "jpmorgan-chase",
    shortName: "JPM",
    entityType: "BANK",
  },
};

// ─── ArticleListItem ────────────────────────────────────────

describe("ArticleListItemSchema", () => {
  it("accepts valid data", () => {
    const result = ArticleListItemSchema.safeParse(articleListItem);
    expect(result.success).toBe(true);
  });

  it("accepts nullable fields as null", () => {
    const result = ArticleListItemSchema.safeParse({
      ...articleListItem,
      headline: null,
      executiveSummary: null,
      publishedAt: null,
      importanceScore: null,
      source: null,
      signal: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing slug", () => {
    const { slug, ...rest } = articleListItem;
    const result = ArticleListItemSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects empty slug", () => {
    const result = ArticleListItemSchema.safeParse({ ...articleListItem, slug: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid articleType", () => {
    const result = ArticleListItemSchema.safeParse({
      ...articleListItem,
      articleType: "INVALID_TYPE",
    });
    expect(result.success).toBe(false);
  });

  it("rejects NaN importanceScore", () => {
    const result = ArticleListItemSchema.safeParse({
      ...articleListItem,
      importanceScore: NaN,
    });
    expect(result.success).toBe(false);
  });

  it("rejects Infinity importanceScore", () => {
    const result = ArticleListItemSchema.safeParse({
      ...articleListItem,
      importanceScore: Infinity,
    });
    expect(result.success).toBe(false);
  });
});

// ─── ArticleDetail ──────────────────────────────────────────

describe("ArticleDetailSchema", () => {
  const articleDetail = {
    slug: "test-article",
    title: "Full Article",
    headline: "Breaking News",
    dek: "A brief deck",
    executiveSummary: "Summary",
    content: "Full article content here with analysis and detail.",
    whyItMatters: "Because institutional adoption grows",
    whatHappened: "A fund launched",
    marketImplications: "Liquidity increases",
    infraImplications: "Settlement speeds up",
    regulatoryImplications: "More clarity expected",
    articleType: "DEEP_DIVE" as const,
    status: "PUBLISHED" as const,
    assetClass: "FIXED_INCOME",
    region: "NORTH_AMERICA",
    importanceScore: 0.9,
    confidenceScore: 0.88,
    sentimentScore: 0.65,
    publishedAt: NOW,
    sourcePublishedAt: NOW,
    updatedAt: NOW,
    sourceUrl: "https://reuters.com/article/123",
    metaTitle: "SEO Title",
    metaDescription: "SEO Description",
    source: { name: "Reuters", slug: "reuters", credibilityTier: "TIER_1" },
    author: { name: "AI Writer", slug: "ai-writer", isAI: true },
    topics: [{ name: "DeFi", slug: "defi", relevance: 0.95 }],
    entities: [
      {
        name: "JPMorgan",
        slug: "jpmorgan-chase",
        entityType: "BANK",
        headquarters: "New York",
        role: "ISSUER",
      },
    ],
    signal: signalFull,
    tags: [nameSlug],
  };

  it("accepts valid full article", () => {
    const result = ArticleDetailSchema.safeParse(articleDetail);
    expect(result.success).toBe(true);
  });

  it("accepts all nullable fields as null", () => {
    const result = ArticleDetailSchema.safeParse({
      ...articleDetail,
      headline: null,
      dek: null,
      executiveSummary: null,
      whyItMatters: null,
      whatHappened: null,
      marketImplications: null,
      infraImplications: null,
      regulatoryImplications: null,
      assetClass: null,
      region: null,
      importanceScore: null,
      confidenceScore: null,
      sentimentScore: null,
      publishedAt: null,
      sourcePublishedAt: null,
      updatedAt: null,
      sourceUrl: null,
      metaTitle: null,
      metaDescription: null,
      source: null,
      author: null,
      signal: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid sourceUrl", () => {
    const result = ArticleDetailSchema.safeParse({
      ...articleDetail,
      sourceUrl: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status enum", () => {
    const result = ArticleDetailSchema.safeParse({
      ...articleDetail,
      status: "UNKNOWN_STATUS",
    });
    expect(result.success).toBe(false);
  });
});

// ─── EntityListItem ─────────────────────────────────────────

describe("EntityListItemSchema", () => {
  const entity = {
    slug: "jpmorgan-chase",
    name: "JPMorgan Chase",
    shortName: "JPM",
    entityType: "BANK" as const,
    description: "Global investment bank",
    headquarters: "New York, NY",
    country: "United States",
    articleCount: 42,
    timelineCount: 15,
  };

  it("accepts valid entity", () => {
    expect(EntityListItemSchema.safeParse(entity).success).toBe(true);
  });

  it("rejects negative articleCount", () => {
    const result = EntityListItemSchema.safeParse({ ...entity, articleCount: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer timelineCount", () => {
    const result = EntityListItemSchema.safeParse({ ...entity, timelineCount: 3.5 });
    expect(result.success).toBe(false);
  });

  it("rejects invalid entityType", () => {
    const result = EntityListItemSchema.safeParse({ ...entity, entityType: "STARTUP" });
    expect(result.success).toBe(false);
  });
});

// ─── EntityDetail ───────────────────────────────────────────

describe("EntityDetailSchema", () => {
  const detail = {
    slug: "jpmorgan-chase",
    name: "JPMorgan Chase",
    shortName: "JPM",
    entityType: "BANK" as const,
    description: "Global investment bank",
    longDescription: "Detailed description of JPMorgan Chase and its history.",
    whyItMatters: "Largest US bank by assets",
    strategicRole: "First mover in blockchain-based settlement",
    website: "https://jpmorgan.com",
    headquarters: "New York, NY",
    country: "United States",
    region: "NORTH_AMERICA",
    founded: "2000",
    articleCount: 42,
    timelineCount: 15,
    articles: [articleListItem],
    topics: [nameSlug],
    timeline: [timelineEvent],
  };

  it("accepts valid entity detail", () => {
    expect(EntityDetailSchema.safeParse(detail).success).toBe(true);
  });

  it("rejects missing articles array", () => {
    const { articles, ...rest } = detail;
    expect(EntityDetailSchema.safeParse(rest).success).toBe(false);
  });
});

// ─── TopicListItem ──────────────────────────────────────────

describe("TopicListItemSchema", () => {
  const topic = {
    name: "Tokenized Funds",
    slug: "tokenized-funds",
    description: "Funds represented as blockchain tokens",
    clusterSlug: "asset-tokenization",
    clusterName: "Asset Tokenization",
    articleCount: 28,
  };

  it("accepts valid topic", () => {
    expect(TopicListItemSchema.safeParse(topic).success).toBe(true);
  });

  it("accepts null cluster fields", () => {
    const result = TopicListItemSchema.safeParse({
      ...topic,
      clusterSlug: null,
      clusterName: null,
    });
    expect(result.success).toBe(true);
  });
});

// ─── TopicDetail ────────────────────────────────────────────

describe("TopicDetailSchema", () => {
  const topicDetail = {
    name: "Tokenized Funds",
    slug: "tokenized-funds",
    description: "Funds represented as blockchain tokens",
    longDescription: "A detailed look at tokenized fund structures.",
    metaTitle: "Tokenized Funds - GMIIE",
    metaDescription: "Track tokenized fund developments",
    cluster: {
      name: "Asset Tokenization",
      slug: "asset-tokenization",
      description: "Tokenization of real-world assets",
    },
    articleCount: 28,
    articles: [articleListItem],
    entities: [
      {
        name: "BlackRock",
        slug: "blackrock",
        entityType: "ASSET_MANAGER",
        description: "Largest asset manager globally",
        articleCount: 12,
      },
    ],
  };

  it("accepts valid topic detail", () => {
    expect(TopicDetailSchema.safeParse(topicDetail).success).toBe(true);
  });

  it("accepts null cluster", () => {
    const result = TopicDetailSchema.safeParse({ ...topicDetail, cluster: null });
    expect(result.success).toBe(true);
  });
});

// ─── TopicClusterItem ───────────────────────────────────────

describe("TopicClusterItemSchema", () => {
  it("accepts valid cluster", () => {
    const cluster = {
      name: "Asset Tokenization",
      slug: "asset-tokenization",
      description: "Tokenization of real-world assets",
      topics: [{ name: "Tokenized Funds", slug: "tokenized-funds", articleCount: 28 }],
      topicCount: 1,
    };
    expect(TopicClusterItemSchema.safeParse(cluster).success).toBe(true);
  });
});

// ─── RegulatorListItem ──────────────────────────────────────

describe("RegulatorListItemSchema", () => {
  const regulator = {
    slug: "sec",
    name: "Securities and Exchange Commission",
    shortName: "SEC",
    entityType: "REGULATOR" as const,
    description: "US securities regulator",
    headquarters: "Washington, DC",
    country: "United States",
    region: "NORTH_AMERICA",
    articleCount: 35,
    timelineCount: 22,
  };

  it("accepts valid regulator", () => {
    expect(RegulatorListItemSchema.safeParse(regulator).success).toBe(true);
  });

  it("rejects entityType not in Prisma EntityType enum", () => {
    const result = RegulatorListItemSchema.safeParse({
      ...regulator,
      entityType: "UNKNOWN",
    });
    expect(result.success).toBe(false);
  });
});

// ─── SignalDimension ────────────────────────────────────────

describe("SignalDimensionSchema", () => {
  it("accepts valid dimension", () => {
    const dim = { key: "institutionalAdoption", label: "Institutional Adoption", score: 0.82 };
    expect(SignalDimensionSchema.safeParse(dim).success).toBe(true);
  });

  it("rejects NaN score", () => {
    const dim = { key: "test", label: "Test", score: NaN };
    expect(SignalDimensionSchema.safeParse(dim).success).toBe(false);
  });
});

// ─── CompositeIndex ─────────────────────────────────────────

describe("CompositeIndexSchema", () => {
  it("accepts valid composite index", () => {
    const index = {
      score: 0.73,
      sampleSize: 150,
      dimensions: [
        { label: "Institutional Adoption", score: 0.82, weight: 0.25 },
        { label: "Regulatory Clarity", score: 0.65, weight: 0.20 },
      ],
    };
    expect(CompositeIndexSchema.safeParse(index).success).toBe(true);
  });

  it("rejects negative sampleSize", () => {
    const result = CompositeIndexSchema.safeParse({
      score: 0.5,
      sampleSize: -1,
      dimensions: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero weight", () => {
    const result = CompositeIndexSchema.safeParse({
      score: 0.5,
      sampleSize: 10,
      dimensions: [{ label: "Test", score: 0.5, weight: 0 }],
    });
    expect(result.success).toBe(false);
  });
});

// ─── TrendingTopicItem ──────────────────────────────────────

describe("TrendingTopicItemSchema", () => {
  it("accepts valid trending topic", () => {
    const item = { name: "CBDC", slug: "cbdc", count: 15 };
    expect(TrendingTopicItemSchema.safeParse(item).success).toBe(true);
  });

  it("rejects negative count", () => {
    const result = TrendingTopicItemSchema.safeParse({ name: "X", slug: "x", count: -1 });
    expect(result.success).toBe(false);
  });
});

// ─── TrendingEntityItem ─────────────────────────────────────

describe("TrendingEntityItemSchema", () => {
  it("accepts valid trending entity", () => {
    const item = { name: "JPMorgan", slug: "jpmorgan-chase", type: "BANK", count: 8 };
    expect(TrendingEntityItemSchema.safeParse(item).success).toBe(true);
  });
});

// ─── TimelineEvent ──────────────────────────────────────────

describe("TimelineEventSchema", () => {
  it("accepts valid event", () => {
    expect(TimelineEventSchema.safeParse(timelineEvent).success).toBe(true);
  });

  it("rejects missing date", () => {
    const { date, ...rest } = timelineEvent;
    expect(TimelineEventSchema.safeParse(rest).success).toBe(false);
  });

  it("rejects invalid date format", () => {
    const result = TimelineEventSchema.safeParse({
      ...timelineEvent,
      date: "Jan 15, 2025",
    });
    expect(result.success).toBe(false);
  });
});

// ─── DashboardCounts ────────────────────────────────────────

describe("DashboardCountsSchema", () => {
  it("accepts valid counts", () => {
    const counts = { articles: 150, entities: 45, topics: 22, sources: 12 };
    expect(DashboardCountsSchema.safeParse(counts).success).toBe(true);
  });

  it("rejects non-integer articles count", () => {
    const result = DashboardCountsSchema.safeParse({
      articles: 1.5,
      entities: 10,
      topics: 5,
      sources: 3,
    });
    expect(result.success).toBe(false);
  });
});
