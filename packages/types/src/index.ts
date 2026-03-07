// ═══════════════════════════════════════════════════════════════
// @xxxiii/types — Shared Type Definitions
// Core domain types for the XXXIII ecosystem
// ═══════════════════════════════════════════════════════════════

// ─── Ingestion Types ───

export interface IngestedItem {
  id: string;
  title: string;
  source: string;
  url: string;
  publishedAt: string;
  author?: string;
  region?: string;
  country?: string;
  language: string;
  assetClass?: string;
  institutionsMentioned: string[];
  regulatorsMentioned: string[];
  tags: string[];
  rawContent: string;
  extractedSummary?: string;
  confidenceScore: number;
  sentiment: number;
  importanceScore: number;
  marketSegment?: string;
  articleType: string;
  canonicalHash: string;
}

export interface SourceConfig {
  id: string;
  name: string;
  url: string;
  feedUrl?: string;
  scrapeMethod: "rss" | "sitemap" | "web_scrape" | "api" | "webhook" | "manual";
  credibilityTier: 1 | 2 | 3 | 4;
  region?: string;
  country?: string;
  language: string;
  scrapeConfig?: Record<string, unknown>;
}

// ─── Classification Types ───

export interface ClassificationResult {
  topic: string;
  topics: string[];
  assetClass?: string;
  jurisdiction?: string;
  institutionType?: string;
  strategicRelevance: number;     // 0-100
  regulatorySignificance: number;
  settlementSignificance: number;
  custodySignificance: number;
  tradingSignificance: number;
  tokenizationRelevance: number;
  infrastructureDependency: number;
  urgency: number;
  confidence: number;
  editorialPriority: "critical" | "high" | "medium" | "low";
}

// ─── Signal Scores ───

export interface SignalScores {
  institutionalAdoption: number;
  regulatoryClarity: number;
  marketReadiness: number;
  infrastructureMaturity: number;
  settlementImpact: number;
  complianceIntensity: number;
  crossBorderRelevance: number;
  liquiditySignificance: number;
  strategicUrgency: number;
  overallScore: number;
}

// ─── Article Types ───

export type ArticleType =
  | "brief"
  | "daily_digest"
  | "weekly_roundup"
  | "executive_summary"
  | "deep_dive"
  | "infra_analysis"
  | "entity_update"
  | "market_map"
  | "strategic_memo"
  | "research_article"
  | "partner_spotlight"
  | "whitepaper"
  | "regulator_tracker"
  | "report";

export interface ArticleDraft {
  title: string;
  headline: string;
  dek: string;
  executiveSummary: string;
  content: string;
  whyItMatters: string;
  whatHappened: string;
  marketImplications: string;
  infraImplications: string;
  regulatoryImplications: string;
  articleType: ArticleType;
  topics: string[];
  entities: string[];
  tags: string[];
  signals: SignalScores;
  metaTitle: string;
  metaDescription: string;
  sourceUrls: string[];
}

// ─── Entity Types ───

export type EntityCategory =
  | "bank"
  | "central_bank"
  | "regulator"
  | "exchange"
  | "custodian"
  | "asset_manager"
  | "tokenization_firm"
  | "infrastructure_provider"
  | "chain"
  | "protocol"
  | "country"
  | "market_utility"
  | "fund"
  | "broker_dealer"
  | "transfer_agent"
  | "clearing_house"
  | "payment_provider"
  | "government_agency";

export interface EntityProfile {
  name: string;
  slug: string;
  entityType: EntityCategory;
  description: string;
  whyItMatters: string;
  strategicRole: string;
  website?: string;
  headquarters?: string;
  country?: string;
  region?: string;
}

// ─── Topic Cluster Types ───

export interface TopicClusterConfig {
  name: string;
  slug: string;
  description: string;
  topics: string[];
  faq: { question: string; answer: string }[];
  glossary: { term: string; definition: string }[];
}

// ─── SEO Types ───

export interface SEOMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  ogImage?: string;
  ogType: string;
  twitterCard: "summary" | "summary_large_image";
  structuredData: Record<string, unknown>;
}

// ─── Job Types ───

export interface JobPayload {
  jobType: string;
  sourceId?: string;
  articleId?: string;
  metadata?: Record<string, unknown>;
}

export type JobStatus = "pending" | "running" | "completed" | "failed" | "retrying";

// ─── API Response Types ───

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
