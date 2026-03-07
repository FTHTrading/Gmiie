/**
 * Article Writer
 * ==============
 * Generates articles of various types (briefs, analyses, deep dives)
 * from classified and scored source material.
 */

import { AIEngine } from './engine';
import { PromptManager } from './prompts';
import type { ArticleDraft, ClassificationResult, ScoreResult } from './types';

export class Writer {
  private engine: AIEngine;
  private prompts: PromptManager;

  constructor(engine: AIEngine, prompts?: PromptManager) {
    this.engine = engine;
    this.prompts = prompts || new PromptManager();
  }

  /**
   * Write an intelligence brief.
   */
  async writeBrief(params: {
    title: string;
    content: string;
    source: string;
    credibility: string;
    publishedAt?: string;
    classification: ClassificationResult;
  }): Promise<{ draft: ArticleDraft; tokensUsed: number; durationMs: number }> {
    const systemPrompt = this.prompts.getSystemPrompt('write_brief');
    const userPrompt = this.prompts.renderUserPrompt('write_brief', {
      title: params.title,
      content: params.content.substring(0, 6000),
      source: params.source,
      credibility: params.credibility,
      publishedAt: params.publishedAt || 'Unknown',
      primaryTopic: params.classification.primaryTopic,
      topicCluster: params.classification.topicCluster,
      assetClass: params.classification.assetClass,
      urgency: params.classification.urgency,
      entities: params.classification.entities.map(e => `${e.name} (${e.type})`).join(', '),
    });

    const { data, meta } = await this.engine.generateJSON<ArticleDraft>({
      systemPrompt,
      userPrompt,
      temperature: 0.4,
      maxTokens: 3000,
    });

    return {
      draft: this.enrichDraft(data, params.classification),
      tokensUsed: meta.totalTokens,
      durationMs: meta.durationMs,
    };
  }

  /**
   * Write a deep analysis article.
   */
  async writeAnalysis(params: {
    title: string;
    content: string;
    source: string;
    credibility: string;
    classification: ClassificationResult;
    score: ScoreResult;
    additionalContext?: string;
  }): Promise<{ draft: ArticleDraft; tokensUsed: number; durationMs: number }> {
    const systemPrompt = this.prompts.getSystemPrompt('write_analysis');
    const userPrompt = this.prompts.renderUserPrompt('write_analysis', {
      content: params.content.substring(0, 10000),
      primaryTopic: params.classification.primaryTopic,
      topicCluster: params.classification.topicCluster,
      assetClass: params.classification.assetClass,
      signalScore: String(params.score.overall),
      entities: params.classification.entities.map(e => `${e.name} (${e.type})`).join(', '),
      additionalContext: params.additionalContext || 'None available.',
    });

    const { data, meta } = await this.engine.generateJSON<ArticleDraft>({
      systemPrompt,
      userPrompt,
      temperature: 0.5,
      maxTokens: 6000,
    });

    return {
      draft: this.enrichDraft(data, params.classification),
      tokensUsed: meta.totalTokens,
      durationMs: meta.durationMs,
    };
  }

  /**
   * Write a comprehensive deep dive.
   */
  async writeDeepDive(params: {
    theme: string;
    classification: ClassificationResult;
    score: ScoreResult;
    sources: string; // Combined source materials
  }): Promise<{ draft: ArticleDraft; tokensUsed: number; durationMs: number }> {
    const systemPrompt = this.prompts.getSystemPrompt('write_deep_dive');
    const userPrompt = this.prompts.renderUserPrompt('write_deep_dive', {
      primaryTopic: params.classification.primaryTopic,
      theme: params.theme,
      topicCluster: params.classification.topicCluster,
      assetClass: params.classification.assetClass,
      signalScore: String(params.score.overall),
      sources: params.sources.substring(0, 15000),
    });

    const { data, meta } = await this.engine.generateJSON<ArticleDraft>({
      systemPrompt,
      userPrompt,
      temperature: 0.5,
      maxTokens: 8000,
    });

    return {
      draft: this.enrichDraft(data, params.classification),
      tokensUsed: meta.totalTokens,
      durationMs: meta.durationMs,
    };
  }

  /**
   * Determine the best article type based on classification and score.
   */
  determineArticleType(classification: ClassificationResult, score: ScoreResult): string {
    if (score.overall >= 8.5) return 'DEEP_DIVE';
    if (score.overall >= 7.0 && classification.urgency === 'BREAKING') return 'SIGNAL_ALERT';
    if (score.overall >= 7.0) return 'ANALYSIS';
    if (classification.articleType === 'REGULATORY_UPDATE') return 'REGULATORY_UPDATE';
    return 'BRIEF';
  }

  /**
   * Enrich a draft with derived fields.
   */
  private enrichDraft(draft: ArticleDraft, classification: ClassificationResult): ArticleDraft {
    // Generate slug from title
    if (!draft.slug) {
      draft.slug = draft.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 80);
    }

    // Estimate read time from body length
    if (!draft.estimatedReadTime && draft.body) {
      const wordCount = draft.body.split(/\s+/).length;
      draft.estimatedReadTime = Math.ceil(wordCount / 250);
    }

    return draft;
  }
}
