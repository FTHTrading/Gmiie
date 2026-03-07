/**
 * AI Engine type definitions.
 */

export interface AIConfig {
  openaiApiKey: string;
  anthropicApiKey?: string;
  defaultModel: string;
  fallbackModel: string;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export interface GenerationResult {
  content: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  durationMs: number;
  finishReason: string;
}

export interface ClassificationResult {
  primaryTopic: string;
  secondaryTopics: string[];
  topicCluster: string;
  assetClass: string;
  entities: ExtractedEntity[];
  articleType: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'MIXED';
  urgency: 'BREAKING' | 'HIGH' | 'NORMAL' | 'LOW';
  confidence: number;
  tags: string[];
}

export interface ExtractedEntity {
  name: string;
  type: string;
  role: string;
  sentiment: string;
  confidence: number;
}

export interface ScoreResult {
  overall: number;
  dimensions: SignalScores;
  reasoning: string;
}

export interface SignalScores {
  marketImpact: number;
  regulatorySignificance: number;
  institutionalRelevance: number;
  technicalImportance: number;
  narrativeStrength: number;
  timeSensitivity: number;
  crossBorderRelevance: number;
  precedentValue: number;
  dataRichness: number;
}

export interface ArticleDraft {
  title: string;
  subtitle: string;
  slug: string;
  summary: string;
  body: string;
  keyPoints: string[];
  implications: string[];
  methodology: string;
  seoTitle: string;
  seoDescription: string;
  faqs: FAQ[];
  estimatedReadTime: number;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface EntityProfile {
  name: string;
  type: string;
  description: string;
  keyFacts: string[];
  recentActivity: string[];
  relevance: string;
  connections: string[];
}

export interface PromptTemplate {
  name: string;
  description: string;
  model: string;
  category: PromptCategory;
  systemPrompt: string;
  userPromptTemplate: string;
  temperature: number;
  maxTokens: number;
  version: string;
}

export type PromptCategory =
  | 'classification'
  | 'scoring'
  | 'writing'
  | 'seo'
  | 'entity'
  | 'newsletter'
  | 'summarization'
  | 'truth-engine'
  | 'prediction'
  | 'intake';
