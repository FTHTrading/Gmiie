// ═══════════════════════════════════════════════════════════════
// GMIIE — Server-side Data Fetching
// These functions call Prisma directly from server components.
// API routes exist for client-side fetching if needed.
// ═══════════════════════════════════════════════════════════════

import { prisma } from "@xxxiii/db";
import type {
  ArticleListItem,
  ArticleDetail,
  EntityListItem,
  EntityDetail,
  TopicListItem,
  TopicDetail,
  TopicClusterItem,
  RegulatorListItem,
  TimelineEvent,
  SignalDimension,
  CompositeIndexModel,
  TrendingTopicItem,
  TrendingEntityItem,
  DashboardCounts,
} from "./models";
import {
  ArticleListItemSchema,
  ArticleDetailSchema,
  EntityListItemSchema,
  EntityDetailSchema,
  TopicListItemSchema,
  TopicDetailSchema,
  TopicClusterItemSchema,
  RegulatorListItemSchema,
  TimelineEventSchema,
  SignalDimensionSchema,
  CompositeIndexSchema,
  TrendingTopicItemSchema,
  TrendingEntityItemSchema,
  DashboardCountsSchema,
} from "./schemas";
import { validateOne, validateMany } from "./validate";

const isoDate = (d: Date | null) => d?.toISOString() ?? null;

// ─── Articles ────────────────────────────────────────────────

export async function getLatestArticles(limit = 20, type?: string): Promise<ArticleListItem[]> {
  const where: Record<string, unknown> = { status: "PUBLISHED" };
  if (type && type !== "all") where.articleType = type;

  const raw = await prisma.article.findMany({
    where,
    select: {
      slug: true,
      title: true,
      headline: true,
      executiveSummary: true,
      articleType: true,
      importanceScore: true,
      publishedAt: true,
      confidenceScore: true,
      source: { select: { name: true, credibilityTier: true } },
      topics: {
        select: { topic: { select: { name: true, slug: true } } },
        take: 3,
      },
      entities: {
        select: { entity: { select: { name: true, slug: true } } },
        take: 4,
      },
      signals: {
        select: {
          institutionalAdoption: true,
          regulatoryClarity: true,
          infrastructureMaturity: true,
          overallScore: true,
        },
        take: 1,
      },
    },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });

  const mapped = raw.map((a): ArticleListItem => ({
    slug: a.slug,
    title: a.title,
    headline: a.headline,
    executiveSummary: a.executiveSummary,
    articleType: a.articleType,
    publishedAt: isoDate(a.publishedAt),
    importanceScore: a.importanceScore,
    confidenceScore: a.confidenceScore ?? null,
    source: a.source ? { name: a.source.name, credibilityTier: a.source.credibilityTier } : null,
    topics: a.topics.map((t) => t.topic),
    entities: a.entities.map((e) => e.entity),
    signal: a.signals[0] ?? null,
  }));
  return validateMany(ArticleListItemSchema, mapped, "getLatestArticles");
}

export async function getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  const raw = await prisma.article.findUnique({
    where: { slug },
    select: {
      slug: true,
      title: true,
      headline: true,
      dek: true,
      executiveSummary: true,
      content: true,
      whyItMatters: true,
      whatHappened: true,
      marketImplications: true,
      infraImplications: true,
      regulatoryImplications: true,
      articleType: true,
      status: true,
      importanceScore: true,
      confidenceScore: true,
      sentimentScore: true,
      assetClass: true,
      region: true,
      publishedAt: true,
      sourcePublishedAt: true,
      sourceUrl: true,
      metaTitle: true,
      updatedAt: true,
      metaDescription: true,
      source: { select: { name: true, slug: true, credibilityTier: true } },
      author: { select: { name: true, slug: true, isAI: true } },
      topics: {
        select: {
          relevance: true,
          topic: { select: { name: true, slug: true } },
        },
      },
      entities: {
        select: {
          role: true,
          entity: {
            select: { name: true, slug: true, entityType: true, headquarters: true },
          },
        },
      },
      signals: {
        select: {
          institutionalAdoption: true,
          regulatoryClarity: true,
          marketReadiness: true,
          infrastructureMaturity: true,
          settlementImpact: true,
          complianceIntensity: true,
          crossBorderRelevance: true,
          liquiditySignificance: true,
          strategicUrgency: true,
          overallScore: true,
        },
        take: 1,
      },
      tags: {
        select: { tag: { select: { name: true, slug: true } } },
      },
    },
  });

  if (!raw) return null;

  const result = {
    slug: raw.slug,
    title: raw.title,
    headline: raw.headline,
    dek: raw.dek,
    executiveSummary: raw.executiveSummary,
    content: raw.content,
    whyItMatters: raw.whyItMatters,
    whatHappened: raw.whatHappened,
    marketImplications: raw.marketImplications,
    infraImplications: raw.infraImplications,
    regulatoryImplications: raw.regulatoryImplications,
    articleType: raw.articleType,
    status: raw.status,
    assetClass: raw.assetClass,
    region: raw.region,
    importanceScore: raw.importanceScore,
    confidenceScore: raw.confidenceScore,
    sentimentScore: raw.sentimentScore,
    publishedAt: isoDate(raw.publishedAt),
    sourcePublishedAt: isoDate(raw.sourcePublishedAt),
    updatedAt: isoDate(raw.updatedAt),
    sourceUrl: raw.sourceUrl,
    metaTitle: raw.metaTitle,
    metaDescription: raw.metaDescription,
    source: raw.source,
    author: raw.author,
    topics: raw.topics.map((t) => ({ ...t.topic, relevance: t.relevance })),
    entities: raw.entities.map((e) => ({ ...e.entity, role: e.role })),
    signal: raw.signals[0] ?? null,
    tags: raw.tags.map((t) => t.tag),
  };
  return validateOne(ArticleDetailSchema, result, "getArticleBySlug");
}

// ─── Entities ────────────────────────────────────────────────

export async function getEntities(limit = 30, type?: string): Promise<EntityListItem[]> {
  const where: Record<string, unknown> = { isActive: true };
  if (type && type !== "all") where.entityType = type;

  const raw = await prisma.entity.findMany({
    where,
    select: {
      slug: true,
      name: true,
      shortName: true,
      entityType: true,
      description: true,
      headquarters: true,
      country: true,
      _count: { select: { articles: true, timeline: true } },
    },
    orderBy: [{ articles: { _count: "desc" } }, { name: "asc" }],
    take: limit,
  });

  const mapped = raw.map((e): EntityListItem => ({
    slug: e.slug,
    name: e.name,
    shortName: e.shortName,
    entityType: e.entityType,
    description: e.description,
    headquarters: e.headquarters,
    country: e.country,
    articleCount: e._count.articles,
    timelineCount: e._count.timeline,
  }));
  return validateMany(EntityListItemSchema, mapped, "getEntities");
}

export async function getEntityBySlug(slug: string): Promise<EntityDetail | null> {
  const raw = await prisma.entity.findUnique({
    where: { slug },
    select: {
      slug: true,
      name: true,
      shortName: true,
      entityType: true,
      description: true,
      longDescription: true,
      whyItMatters: true,
      strategicRole: true,
      website: true,
      headquarters: true,
      country: true,
      region: true,
      founded: true,
      articles: {
        where: { article: { status: "PUBLISHED" } },
        select: {
          article: {
            select: {
              slug: true,
              title: true,
              executiveSummary: true,
              articleType: true,
              importanceScore: true,
              confidenceScore: true,
              publishedAt: true,
              source: { select: { name: true, credibilityTier: true } },
              topics: {
                select: { topic: { select: { name: true, slug: true } } },
                take: 2,
              },
              entities: {
                select: { entity: { select: { name: true, slug: true } } },
                take: 3,
              },
              signals: {
                select: {
                  institutionalAdoption: true,
                  regulatoryClarity: true,
                  infrastructureMaturity: true,
                  overallScore: true,
                },
                take: 1,
              },
            },
          },
        },
        orderBy: { article: { publishedAt: "desc" } },
        take: 15,
      },
      topics: {
        select: { topic: { select: { name: true, slug: true } } },
      },
      timeline: {
        select: {
          id: true,
          title: true,
          description: true,
          date: true,
          sourceUrl: true,
        },
        orderBy: { date: "desc" },
        take: 20,
      },
      _count: { select: { articles: true, timeline: true } },
    },
  });

  if (!raw) return null;

  const result = {
    slug: raw.slug,
    name: raw.name,
    shortName: raw.shortName,
    entityType: raw.entityType,
    description: raw.description,
    longDescription: raw.longDescription,
    whyItMatters: raw.whyItMatters,
    strategicRole: raw.strategicRole,
    website: raw.website,
    headquarters: raw.headquarters,
    country: raw.country,
    region: raw.region,
    founded: raw.founded,
    articleCount: raw._count.articles,
    timelineCount: raw._count.timeline,
    articles: raw.articles.map((ae): ArticleListItem => ({
      slug: ae.article.slug,
      title: ae.article.title,
      headline: null,
      executiveSummary: ae.article.executiveSummary,
      articleType: ae.article.articleType,
      publishedAt: isoDate(ae.article.publishedAt),
      importanceScore: ae.article.importanceScore,
      confidenceScore: ae.article.confidenceScore ?? null,
      source: ae.article.source,
      topics: ae.article.topics.map((t) => t.topic),
      entities: ae.article.entities.map((e) => e.entity),
      signal: ae.article.signals[0] ?? null,
    })),
    topics: raw.topics.map((t) => t.topic),
    timeline: raw.timeline.map((te): TimelineEvent => ({
      id: te.id,
      title: te.title,
      description: te.description,
      date: te.date.toISOString(),
      sourceUrl: te.sourceUrl,
      entity: {
        name: raw.name,
        slug: raw.slug,
        shortName: raw.shortName,
        entityType: raw.entityType,
      },
    })),
  };
  return validateOne(EntityDetailSchema, result, "getEntityBySlug");
}

// ─── Topics ──────────────────────────────────────────────────

export async function getTopics(): Promise<TopicListItem[]> {
  const raw = await prisma.topic.findMany({
    where: { isActive: true },
    select: {
      name: true,
      slug: true,
      description: true,
      cluster: { select: { name: true, slug: true } },
      _count: { select: { articles: true } },
    },
    orderBy: [{ articles: { _count: "desc" } }, { sortOrder: "asc" }],
  });

  const mapped = raw.map((t): TopicListItem => ({
    name: t.name,
    slug: t.slug,
    description: t.description,
    clusterSlug: t.cluster?.slug ?? null,
    clusterName: t.cluster?.name ?? null,
    articleCount: t._count.articles,
  }));
  return validateMany(TopicListItemSchema, mapped, "getTopics");
}

export async function getTopicBySlug(slug: string): Promise<TopicDetail | null> {
  const raw = await prisma.topic.findUnique({
    where: { slug },
    select: {
      name: true,
      slug: true,
      description: true,
      longDescription: true,
      metaTitle: true,
      metaDescription: true,
      cluster: { select: { name: true, slug: true, description: true } },
      articles: {
        where: { article: { status: "PUBLISHED" } },
        select: {
          article: {
            select: {
              slug: true,
              title: true,
              executiveSummary: true,
              articleType: true,
              importanceScore: true,
              confidenceScore: true,
              publishedAt: true,
              source: { select: { name: true, credibilityTier: true } },
              entities: {
                select: { entity: { select: { name: true, slug: true } } },
                take: 3,
              },
              signals: {
                select: {
                  institutionalAdoption: true,
                  regulatoryClarity: true,
                  infrastructureMaturity: true,
                  overallScore: true,
                },
                take: 1,
              },
            },
          },
        },
        orderBy: { article: { publishedAt: "desc" } },
        take: 20,
      },
      entities: {
        select: {
          entity: {
            select: {
              name: true,
              slug: true,
              entityType: true,
              description: true,
              _count: { select: { articles: true } },
            },
          },
        },
        take: 10,
      },
      _count: { select: { articles: true } },
    },
  });

  if (!raw) return null;

  const result = {
    name: raw.name,
    slug: raw.slug,
    description: raw.description,
    longDescription: raw.longDescription,
    metaTitle: raw.metaTitle,
    metaDescription: raw.metaDescription,
    cluster: raw.cluster,
    articleCount: raw._count.articles,
    articles: raw.articles.map((at): ArticleListItem => ({
      slug: at.article.slug,
      title: at.article.title,
      headline: null,
      executiveSummary: at.article.executiveSummary,
      articleType: at.article.articleType,
      publishedAt: isoDate(at.article.publishedAt),
      importanceScore: at.article.importanceScore,
      confidenceScore: at.article.confidenceScore ?? null,
      source: at.article.source,
      topics: [],
      entities: at.article.entities.map((e) => e.entity),
      signal: at.article.signals[0] ?? null,
    })),
    entities: raw.entities.map((re) => ({
      name: re.entity.name,
      slug: re.entity.slug,
      entityType: re.entity.entityType,
      description: re.entity.description,
      articleCount: re.entity._count.articles,
    })),
  };
  return validateOne(TopicDetailSchema, result, "getTopicBySlug");
}

export async function getTopicClusters(): Promise<TopicClusterItem[]> {
  const raw = await prisma.topicCluster.findMany({
    select: {
      name: true,
      slug: true,
      description: true,
      topics: {
        where: { isActive: true },
        select: {
          name: true,
          slug: true,
          _count: { select: { articles: true } },
        },
        orderBy: { sortOrder: "asc" },
      },
      _count: { select: { topics: true } },
    },
    orderBy: { name: "asc" },
  });

  const mapped = raw.map((c): TopicClusterItem => ({
    name: c.name,
    slug: c.slug,
    description: c.description,
    topics: c.topics.map((t) => ({
      name: t.name,
      slug: t.slug,
      articleCount: t._count.articles,
    })),
    topicCount: c._count.topics,
  }));
  return validateMany(TopicClusterItemSchema, mapped, "getTopicClusters");
}

// ─── Signals Aggregate ───────────────────────────────────────

export async function getAggregateSignals(): Promise<SignalDimension[]> {
  const signals = await prisma.signal.findMany({
    where: {
      article: {
        status: "PUBLISHED",
        publishedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    },
    select: {
      institutionalAdoption: true,
      regulatoryClarity: true,
      marketReadiness: true,
      infrastructureMaturity: true,
      settlementImpact: true,
      complianceIntensity: true,
      crossBorderRelevance: true,
      liquiditySignificance: true,
      strategicUrgency: true,
    },
    orderBy: { generatedAt: "desc" },
    take: 100,
  });

  const avg = (field: keyof typeof signals[0]) => {
    const values = signals
      .map((s) => s[field] as number | null)
      .filter((v): v is number => v != null && v > 0);
    if (values.length === 0) return 0;
    // DB stores 0-100; convert to 0-10 scale (matching DEFAULT_SIGNALS & composite index)
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length) / 10;
  };

  const mapped = [
    { key: "institutional_adoption", label: "Institutional Adoption", score: avg("institutionalAdoption") },
    { key: "regulatory_clarity", label: "Regulatory Clarity", score: avg("regulatoryClarity") },
    { key: "market_readiness", label: "Market Readiness", score: avg("marketReadiness") },
    { key: "infrastructure_maturity", label: "Infrastructure Maturity", score: avg("infrastructureMaturity") },
    { key: "settlement_impact", label: "Settlement Impact", score: avg("settlementImpact") },
    { key: "compliance_intensity", label: "Compliance Intensity", score: avg("complianceIntensity") },
    { key: "cross_border_relevance", label: "Cross-Border Relevance", score: avg("crossBorderRelevance") },
    { key: "liquidity_significance", label: "Liquidity Significance", score: avg("liquiditySignificance") },
    { key: "strategic_urgency", label: "Strategic Urgency", score: avg("strategicUrgency") },
  ];
  return validateMany(SignalDimensionSchema, mapped, "getAggregateSignals");
}

// ─── Trending Topics ─────────────────────────────────────────

export async function getTrendingTopics(limit = 8, days = 7): Promise<TrendingTopicItem[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  // Topics that have recent published articles, ordered by coverage
  const topics = await prisma.topic.findMany({
    where: {
      isActive: true,
      articles: {
        some: {
          article: {
            status: "PUBLISHED",
            publishedAt: { gte: since },
          },
        },
      },
    },
    select: {
      name: true,
      slug: true,
      _count: { select: { articles: true } },
    },
    orderBy: { articles: { _count: "desc" } },
    take: limit,
  });

  const mapped = topics.map((t) => ({
    name: t.name,
    slug: t.slug,
    count: t._count.articles,
  }));
  return validateMany(TrendingTopicItemSchema, mapped, "getTrendingTopics");
}

// ─── Trending Entities ───────────────────────────────────────

export async function getTrendingEntities(limit = 6, days = 7): Promise<TrendingEntityItem[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const entities = await prisma.entity.findMany({
    where: {
      isActive: true,
      articles: {
        some: {
          article: {
            status: "PUBLISHED",
            publishedAt: { gte: since },
          },
        },
      },
    },
    select: {
      name: true,
      slug: true,
      shortName: true,
      entityType: true,
      _count: { select: { articles: true } },
    },
    orderBy: { articles: { _count: "desc" } },
    take: limit,
  });

  const mapped = entities.map((e) => ({
    name: e.shortName || e.name,
    slug: e.slug,
    type: e.entityType,
    count: e._count.articles,
  }));
  return validateMany(TrendingEntityItemSchema, mapped, "getTrendingEntities");
}

// ─── Composite GMIIE Index ───────────────────────────────────

const SIGNAL_WEIGHTS: Record<string, number> = {
  institutionalAdoption: 0.15,
  regulatoryClarity: 0.15,
  marketReadiness: 0.10,
  infrastructureMaturity: 0.12,
  settlementImpact: 0.10,
  complianceIntensity: 0.08,
  crossBorderRelevance: 0.10,
  liquiditySignificance: 0.10,
  strategicUrgency: 0.10,
};

export async function getCompositeIndex(): Promise<CompositeIndexModel | null> {
  const signals = await prisma.signal.findMany({
    where: {
      article: {
        status: "PUBLISHED",
        publishedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    },
    select: {
      institutionalAdoption: true,
      regulatoryClarity: true,
      marketReadiness: true,
      infrastructureMaturity: true,
      settlementImpact: true,
      complianceIntensity: true,
      crossBorderRelevance: true,
      liquiditySignificance: true,
      strategicUrgency: true,
    },
    orderBy: { generatedAt: "desc" },
    take: 100,
  });

  if (signals.length === 0) return null;

  const avg = (field: string) => {
    const values = signals
      .map((s) => (s as Record<string, number | null>)[field])
      .filter((v): v is number => v != null && v > 0);
    if (values.length === 0) return 0;
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  let composite = 0;
  const dimensions: { label: string; score: number; weight: number }[] = [];

  for (const [field, weight] of Object.entries(SIGNAL_WEIGHTS)) {
    const score = avg(field);
    composite += score * weight;
    const label = field
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
    dimensions.push({ label, score: Math.round(score) / 10, weight });
  }

  const result = {
    score: Math.round(composite) / 10, // 0-10 scale
    sampleSize: signals.length,
    dimensions,
  };
  return validateOne(CompositeIndexSchema, result, "getCompositeIndex");
}

// ─── Timeline Events ─────────────────────────────────────────

export async function getTimelineEvents(limit = 50): Promise<TimelineEvent[]> {
  const raw = await prisma.timelineEvent.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      date: true,
      sourceUrl: true,
      entity: {
        select: {
          name: true,
          slug: true,
          shortName: true,
          entityType: true,
        },
      },
    },
    orderBy: { date: "desc" },
    take: limit,
  });

  const mapped = raw.map((te): TimelineEvent => ({
    id: te.id,
    title: te.title,
    description: te.description,
    date: te.date.toISOString(),
    sourceUrl: te.sourceUrl,
    entity: te.entity,
  }));
  return validateMany(TimelineEventSchema, mapped, "getTimelineEvents");
}

// ─── Regulators ──────────────────────────────────────────────

export async function getRegulators(): Promise<RegulatorListItem[]> {
  const raw = await prisma.entity.findMany({
    where: {
      isActive: true,
      entityType: { in: ["REGULATOR", "CENTRAL_BANK", "GOVERNMENT_AGENCY"] },
    },
    select: {
      slug: true,
      name: true,
      shortName: true,
      entityType: true,
      description: true,
      headquarters: true,
      country: true,
      region: true,
      _count: { select: { articles: true, timeline: true } },
    },
    orderBy: [{ articles: { _count: "desc" } }, { name: "asc" }],
  });

  const mapped = raw.map((e): RegulatorListItem => ({
    slug: e.slug,
    name: e.name,
    shortName: e.shortName,
    entityType: e.entityType,
    description: e.description,
    headquarters: e.headquarters,
    country: e.country,
    region: e.region,
    articleCount: e._count.articles,
    timelineCount: e._count.timeline,
  }));
  return validateMany(RegulatorListItemSchema, mapped, "getRegulators");
}

// ─── Counts (for dashboard) ─────────────────────────────────

export async function getDashboardCounts(): Promise<DashboardCounts> {
  const [articles, entities, topics, sources] = await Promise.all([
    prisma.article.count({ where: { status: "PUBLISHED" } }),
    prisma.entity.count({ where: { isActive: true } }),
    prisma.topic.count({ where: { isActive: true } }),
    prisma.source.count({ where: { isActive: true } }),
  ]);

  return validateOne(DashboardCountsSchema, { articles, entities, topics, sources }, "getDashboardCounts");
}
