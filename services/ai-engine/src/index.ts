/**
 * XXXIII AI Engine
 * ================
 * Central AI processing engine for the XXXIII intelligence ecosystem.
 *
 * Capabilities:
 * - Content classification (topic, asset class, entity extraction)
 * - Signal scoring (9-dimension scoring system)
 * - Article generation (briefs, analysis, deep dives)
 * - Entity profile building
 * - SEO optimization (titles, meta descriptions, FAQs)
 * - Newsletter compilation
 */

export { AIEngine } from './engine';
export { PromptManager } from './prompts';
export { Classifier } from './classifier';
export { Scorer } from './scorer';
export { Writer } from './writer';
export { EntityProfiler } from './entity-profiler';
export { SEOOptimizer } from './seo-optimizer';
export type { AIConfig, GenerationResult, ClassificationResult, ScoreResult } from './types';
