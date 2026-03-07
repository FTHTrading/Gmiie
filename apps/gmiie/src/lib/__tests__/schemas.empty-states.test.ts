// ═══════════════════════════════════════════════════════════════
// GMIIE — Empty State / Edge Case Tests
// Verify schemas handle graceful degradation scenarios:
// - No source, no signals, no cluster
// - Null entity on timeline events
// - Missing headline, empty topics/entities arrays
// - Zero article counts
// Truth systems must fail gracefully when reality is incomplete.
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

const NOW = "2025-01-15T12:00:00.000Z";

// ─── Article empty states ───────────────────────────────────

describe("ArticleListItem — empty states", () => {
  const minimal = {
    slug: "minimal-article",
    title: "Minimal Article",
    headline: null,
    executiveSummary: null,
    articleType: "BRIEF" as const,
    publishedAt: null,
    importanceScore: null,
    source: null,
    topics: [],
    entities: [],
    signal: null,
  };

  it("accepts article with no source", () => {
    expect(ArticleListItemSchema.safeParse(minimal).success).toBe(true);
  });

  it("accepts article with no signals", () => {
    expect(ArticleListItemSchema.safeParse({ ...minimal, signal: null }).success).toBe(true);
  });

  it("accepts article with empty topics and entities arrays", () => {
    const result = ArticleListItemSchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.topics).toEqual([]);
      expect(result.data.entities).toEqual([]);
    }
  });

  it("accepts article with null headline", () => {
    expect(ArticleListItemSchema.safeParse({ ...minimal, headline: null }).success).toBe(true);
  });

  it("accepts article with null publishedAt (no date)", () => {
    expect(ArticleListItemSchema.safeParse({ ...minimal, publishedAt: null }).success).toBe(true);
  });

  it("accepts article with all-null signal fields", () => {
    const nullSignal = {
      institutionalAdoption: null,
      regulatoryClarity: null,
      infrastructureMaturity: null,
      overallScore: null,
    };
    const result = ArticleListItemSchema.safeParse({ ...minimal, signal: nullSignal });
    expect(result.success).toBe(true);
  });
});

describe("ArticleDetail — empty states", () => {
  const minimalDetail = {
    slug: "minimal-detail",
    title: "Minimal Detail",
    headline: null,
    dek: null,
    executiveSummary: null,
    content: "Content is required.",
    whyItMatters: null,
    whatHappened: null,
    marketImplications: null,
    infraImplications: null,
    regulatoryImplications: null,
    articleType: "BRIEF" as const,
    status: "DRAFT" as const,
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
    topics: [],
    entities: [],
    signal: null,
    tags: [],
  };

  it("accepts article with all optional fields null", () => {
    expect(ArticleDetailSchema.safeParse(minimalDetail).success).toBe(true);
  });

  it("accepts article with no author", () => {
    expect(ArticleDetailSchema.safeParse({ ...minimalDetail, author: null }).success).toBe(true);
  });

  it("accepts article with empty tags", () => {
    const result = ArticleDetailSchema.safeParse({ ...minimalDetail, tags: [] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual([]);
    }
  });

  it("accepts article with all-null signal full fields", () => {
    const nullSignalFull = {
      institutionalAdoption: null,
      regulatoryClarity: null,
      infrastructureMaturity: null,
      overallScore: null,
      marketReadiness: null,
      settlementImpact: null,
      complianceIntensity: null,
      crossBorderRelevance: null,
      liquiditySignificance: null,
      strategicUrgency: null,
    };
    const result = ArticleDetailSchema.safeParse({
      ...minimalDetail,
      signal: nullSignalFull,
    });
    expect(result.success).toBe(true);
  });
});

// ─── Entity empty states ────────────────────────────────────

describe("EntityListItem — empty states", () => {
  const minimal = {
    slug: "unknown-entity",
    name: "Unknown Entity",
    shortName: null,
    entityType: "INFRASTRUCTURE_PROVIDER" as const,
    description: null,
    headquarters: null,
    country: null,
    articleCount: 0,
    timelineCount: 0,
  };

  it("accepts entity with zero article and timeline counts", () => {
    expect(EntityListItemSchema.safeParse(minimal).success).toBe(true);
  });

  it("accepts entity with all descriptive fields null", () => {
    const result = EntityListItemSchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeNull();
      expect(result.data.headquarters).toBeNull();
      expect(result.data.country).toBeNull();
      expect(result.data.shortName).toBeNull();
    }
  });
});

describe("EntityDetail — empty states", () => {
  const minimal = {
    slug: "new-entity",
    name: "New Entity",
    shortName: null,
    entityType: "PROTOCOL" as const,
    description: null,
    longDescription: null,
    whyItMatters: null,
    strategicRole: null,
    website: null,
    headquarters: null,
    country: null,
    region: null,
    founded: null,
    articleCount: 0,
    timelineCount: 0,
    articles: [],
    topics: [],
    timeline: [],
  };

  it("accepts entity with empty articles, topics, and timeline", () => {
    const result = EntityDetailSchema.safeParse(minimal);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.articles).toEqual([]);
      expect(result.data.topics).toEqual([]);
      expect(result.data.timeline).toEqual([]);
    }
  });

  it("accepts entity with no website or founded date", () => {
    expect(EntityDetailSchema.safeParse(minimal).success).toBe(true);
  });
});

// ─── Topic empty states ─────────────────────────────────────

describe("TopicListItem — empty states", () => {
  it("accepts topic with no cluster", () => {
    const topic = {
      name: "Orphan Topic",
      slug: "orphan-topic",
      description: null,
      clusterSlug: null,
      clusterName: null,
      articleCount: 0,
    };
    expect(TopicListItemSchema.safeParse(topic).success).toBe(true);
  });

  it("accepts topic with zero article count", () => {
    const topic = {
      name: "Empty Topic",
      slug: "empty-topic",
      description: null,
      clusterSlug: null,
      clusterName: null,
      articleCount: 0,
    };
    expect(TopicListItemSchema.safeParse(topic).success).toBe(true);
  });
});

describe("TopicDetail — empty states", () => {
  it("accepts topic with no cluster, no articles, no entities", () => {
    const detail = {
      name: "New Topic",
      slug: "new-topic",
      description: null,
      longDescription: null,
      metaTitle: null,
      metaDescription: null,
      cluster: null,
      articleCount: 0,
      articles: [],
      entities: [],
    };
    const result = TopicDetailSchema.safeParse(detail);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.cluster).toBeNull();
      expect(result.data.articles).toEqual([]);
      expect(result.data.entities).toEqual([]);
    }
  });
});

describe("TopicClusterItem — empty states", () => {
  it("accepts cluster with empty topics array", () => {
    const cluster = {
      name: "Empty Cluster",
      slug: "empty-cluster",
      description: null,
      topics: [],
      topicCount: 0,
    };
    expect(TopicClusterItemSchema.safeParse(cluster).success).toBe(true);
  });
});

// ─── Regulator empty states ─────────────────────────────────

describe("RegulatorListItem — empty states", () => {
  it("accepts regulator with minimal data", () => {
    const reg = {
      slug: "new-regulator",
      name: "New Regulator",
      shortName: null,
      entityType: "REGULATOR" as const,
      description: null,
      headquarters: null,
      country: null,
      region: null,
      articleCount: 0,
      timelineCount: 0,
    };
    expect(RegulatorListItemSchema.safeParse(reg).success).toBe(true);
  });
});

// ─── Timeline — null entity ─────────────────────────────────

describe("TimelineEvent — empty states", () => {
  it("accepts event with null entity", () => {
    const event = {
      id: "evt-orphan",
      title: "Orphan Event",
      description: null,
      date: NOW,
      sourceUrl: null,
      entity: null,
    };
    expect(TimelineEventSchema.safeParse(event).success).toBe(true);
  });

  it("accepts event with null description and sourceUrl", () => {
    const event = {
      id: "evt-bare",
      title: "Bare Event",
      description: null,
      date: NOW,
      sourceUrl: null,
      entity: {
        name: "SEC",
        slug: "sec",
        shortName: null,
        entityType: "REGULATOR",
      },
    };
    const result = TimelineEventSchema.safeParse(event);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeNull();
      expect(result.data.sourceUrl).toBeNull();
    }
  });
});

// ─── Signal / Composite — edge cases ────────────────────────

describe("SignalDimension — edge cases", () => {
  it("accepts zero score", () => {
    expect(
      SignalDimensionSchema.safeParse({
        key: "test",
        label: "Test",
        score: 0,
      }).success,
    ).toBe(true);
  });

  it("accepts negative score (some signals can be negative)", () => {
    expect(
      SignalDimensionSchema.safeParse({
        key: "sentiment",
        label: "Sentiment",
        score: -0.5,
      }).success,
    ).toBe(true);
  });
});

describe("CompositeIndex — empty states", () => {
  it("accepts composite index with empty dimensions", () => {
    const result = CompositeIndexSchema.safeParse({
      score: 0,
      sampleSize: 0,
      dimensions: [],
    });
    expect(result.success).toBe(true);
  });
});

// ─── Trending — zero counts ─────────────────────────────────

describe("TrendingTopicItem — empty states", () => {
  it("accepts zero count", () => {
    expect(
      TrendingTopicItemSchema.safeParse({ name: "New", slug: "new", count: 0 }).success,
    ).toBe(true);
  });
});

describe("TrendingEntityItem — empty states", () => {
  it("accepts zero count", () => {
    expect(
      TrendingEntityItemSchema.safeParse({
        name: "New Corp",
        slug: "new-corp",
        type: "BANK",
        count: 0,
      }).success,
    ).toBe(true);
  });
});

// ─── Dashboard — zero everything ────────────────────────────

describe("DashboardCounts — empty states", () => {
  it("accepts all zero counts", () => {
    const result = DashboardCountsSchema.safeParse({
      articles: 0,
      entities: 0,
      topics: 0,
      sources: 0,
    });
    expect(result.success).toBe(true);
  });
});
