// ═══════════════════════════════════════════════════════════════
// GMIIE — Shared View-Model Types
// Canonical shapes that sit between the Prisma data layer and
// the UI components. Every page and component should import from
// here instead of hand-authoring inline types.
//
// Rules:
//  1. One type per view boundary (card, detail page, panel, etc.)
//  2. All dates are ISO strings (serialization-safe)
//  3. Relations are pre-flattened — no Prisma join wrappers
//  4. Nullability matches what the mapper function guarantees
// ═══════════════════════════════════════════════════════════════

// ─── Shared Fragments ────────────────────────────────────────

export interface NameSlug {
  name: string;
  slug: string;
}

export interface SignalSnapshot {
  institutionalAdoption: number | null;
  regulatoryClarity: number | null;
  infrastructureMaturity: number | null;
  overallScore: number | null;
}

export interface SignalFull extends SignalSnapshot {
  marketReadiness: number | null;
  settlementImpact: number | null;
  complianceIntensity: number | null;
  crossBorderRelevance: number | null;
  liquiditySignificance: number | null;
  strategicUrgency: number | null;
}

// ─── Article List Item (feed cards, report cards) ────────────

export interface ArticleListItem {
  slug: string;
  title: string;
  headline: string | null;
  executiveSummary: string | null;
  articleType: string;
  publishedAt: string | null; // ISO string
  importanceScore: number | null;
  confidenceScore: number | null;
  source: { name: string; credibilityTier: string } | null;
  topics: NameSlug[];
  entities: NameSlug[];
  signal: SignalSnapshot | null;
}

// ─── Article Detail (intelligence/[slug] page) ──────────────

export interface ArticleDetail {
  slug: string;
  title: string;
  headline: string | null;
  dek: string | null;
  executiveSummary: string | null;
  content: string;
  whyItMatters: string | null;
  whatHappened: string | null;
  marketImplications: string | null;
  infraImplications: string | null;
  regulatoryImplications: string | null;
  articleType: string;
  status: string;
  assetClass: string | null;
  region: string | null;
  importanceScore: number | null;
  confidenceScore: number | null;
  sentimentScore: number | null;
  publishedAt: string | null;
  sourcePublishedAt: string | null;
  updatedAt: string | null;
  sourceUrl: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  source: { name: string; slug: string; credibilityTier: string } | null;
  author: { name: string; slug: string; isAI: boolean } | null;
  topics: { name: string; slug: string; relevance: number | null }[];
  entities: { name: string; slug: string; entityType: string; headquarters: string | null; role: string | null }[];
  signal: SignalFull | null;
  tags: NameSlug[];
}

// ─── Entity Card (list view) ────────────────────────────────

export interface EntityListItem {
  slug: string;
  name: string;
  shortName: string | null;
  entityType: string;
  description: string | null;
  headquarters: string | null;
  country: string | null;
  articleCount: number;
  timelineCount: number;
}

// ─── Entity Detail (entities/[slug] page) ────────────────────

export interface EntityDetail {
  slug: string;
  name: string;
  shortName: string | null;
  entityType: string;
  description: string | null;
  longDescription: string | null;
  whyItMatters: string | null;
  strategicRole: string | null;
  website: string | null;
  headquarters: string | null;
  country: string | null;
  region: string | null;
  founded: string | null;
  articleCount: number;
  timelineCount: number;
  articles: ArticleListItem[];
  topics: NameSlug[];
  timeline: TimelineEvent[];
}

// ─── Topic List Item ────────────────────────────────────────

export interface TopicListItem {
  name: string;
  slug: string;
  description: string | null;
  clusterSlug: string | null;
  clusterName: string | null;
  articleCount: number;
}

// ─── Topic Detail (topics/[slug] page) ──────────────────────

export interface TopicDetail {
  name: string;
  slug: string;
  description: string | null;
  longDescription: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  cluster: { name: string; slug: string; description: string | null } | null;
  articleCount: number;
  articles: ArticleListItem[];
  entities: {
    name: string;
    slug: string;
    entityType: string;
    description: string | null;
    articleCount: number;
  }[];
}

// ─── Topic Cluster ──────────────────────────────────────────

export interface TopicClusterItem {
  name: string;
  slug: string;
  description: string | null;
  topics: { name: string; slug: string; articleCount: number }[];
  topicCount: number;
}

// ─── Regulator Card ─────────────────────────────────────────

export interface RegulatorListItem {
  slug: string;
  name: string;
  shortName: string | null;
  entityType: string;
  description: string | null;
  headquarters: string | null;
  country: string | null;
  region: string | null;
  articleCount: number;
  timelineCount: number;
}

// ─── Signal Aggregate ───────────────────────────────────────

export interface SignalDimension {
  key: string;
  label: string;
  score: number;
}

// ─── Composite Index ────────────────────────────────────────

export interface CompositeIndexModel {
  score: number;
  sampleSize: number;
  dimensions: { label: string; score: number; weight: number }[];
}

// ─── Trending Topic ─────────────────────────────────────────

export interface TrendingTopicItem {
  name: string;
  slug: string;
  count: number;
}

// ─── Trending Entity ────────────────────────────────────────

export interface TrendingEntityItem {
  name: string;
  slug: string;
  type: string;
  count: number;
}

// ─── Timeline Event ─────────────────────────────────────────

export interface TimelineEvent {
  id: string;
  title: string;
  description: string | null;
  date: string; // ISO string
  sourceUrl: string | null;
  entity: {
    name: string;
    slug: string;
    shortName: string | null;
    entityType: string;
  } | null;
}

// ─── Dashboard Counts ───────────────────────────────────────

export interface DashboardCounts {
  articles: number;
  entities: number;
  topics: number;
  sources: number;
}

// ─── State Stablecoin Tracker ───────────────────────────────

export interface BillUpdateItem {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  date: string; // ISO
  sourceUrl: string | null;
}

export interface BillListItem {
  id: string;
  billNumber: string;
  title: string;
  summary: string | null;
  whatChanged: string | null;
  whyItMatters: string | null;
  status: string;
  chamber: string | null;
  sponsorName: string | null;
  sourceUrl: string | null;
  confidenceScore: number | null;
  credibilityTier: string;
  introducedDate: string | null;
  lastActionDate: string | null;
  updates: BillUpdateItem[];
}

export interface StateTrackerListItem {
  slug: string;
  name: string;
  abbreviation: string;
  status: string;
  summary: string | null;
  whyItMatters: string | null;
  nextExpectedStep: string | null;
  lastActionDate: string | null;
  billCount: number;
  latestBillStatus: string | null;
}

export interface StateTrackerDetail {
  slug: string;
  name: string;
  abbreviation: string;
  status: string;
  summary: string | null;
  whyItMatters: string | null;
  nextExpectedStep: string | null;
  lastActionDate: string | null;
  bills: BillListItem[];
  updates: StateUpdateItem[];
}

export interface StateUpdateItem {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  date: string; // ISO
  sourceUrl: string | null;
}

// ─── Entity Graph / Financial System Map ─────────────────────────────────────
export interface GraphNode {
  id: string;
  name: string;
  shortName: string | null;
  slug: string;
  entityType: string;
  country: string | null;
  region: string | null;
  articleCount: number;
  topicIds: string[];
}

export interface GraphEdge {
  source: string;
  target: string;
  sharedTopics: number;
}

export interface EntityGraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
