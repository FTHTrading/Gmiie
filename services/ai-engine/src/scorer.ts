/**
 * Signal Scorer
 * =============
 * Scores intelligence items across 9 dimensions,
 * producing the XXXIII Signal Score.
 */

import { AIEngine } from './engine';
import { PromptManager } from './prompts';
import type { ScoreResult, SignalScores } from './types';

export class Scorer {
  private engine: AIEngine;
  private prompts: PromptManager;

  constructor(engine: AIEngine, prompts?: PromptManager) {
    this.engine = engine;
    this.prompts = prompts || new PromptManager();
  }

  /**
   * Score a classified article.
   */
  async score(params: {
    title: string;
    summary: string;
    source: string;
    credibility: string;
    articleType: string;
  }): Promise<{ score: ScoreResult; tokensUsed: number; durationMs: number }> {
    const systemPrompt = this.prompts.getSystemPrompt('score_signal');
    const userPrompt = this.prompts.renderUserPrompt('score_signal', {
      title: params.title,
      summary: params.summary,
      source: params.source,
      credibility: params.credibility,
      articleType: params.articleType,
    });

    const { data, meta } = await this.engine.generateJSON<ScoreResult>({
      systemPrompt,
      userPrompt,
      temperature: 0.2,
      maxTokens: 1500,
    });

    // Validate and clamp scores
    const validatedScores = this.validateScores(data.dimensions);

    return {
      score: {
        overall: this.calculateOverall(validatedScores, params.credibility),
        dimensions: validatedScores,
        reasoning: data.reasoning || '',
      },
      tokensUsed: meta.totalTokens,
      durationMs: meta.durationMs,
    };
  }

  /**
   * Calculate the weighted overall score.
   * Weighting varies by source credibility tier.
   */
  private calculateOverall(scores: SignalScores, credibility: string): number {
    let weights: Record<keyof SignalScores, number>;

    if (credibility === 'TIER_1') {
      // For TIER_1 (regulators, central banks): weight regulatory and market impact higher
      weights = {
        marketImpact: 1.5,
        regulatorySignificance: 1.5,
        institutionalRelevance: 1.2,
        technicalImportance: 1.0,
        narrativeStrength: 0.8,
        timeSensitivity: 1.1,
        crossBorderRelevance: 1.0,
        precedentValue: 1.2,
        dataRichness: 0.8,
      };
    } else if (credibility === 'TIER_2') {
      weights = {
        marketImpact: 1.3,
        regulatorySignificance: 1.1,
        institutionalRelevance: 1.3,
        technicalImportance: 1.0,
        narrativeStrength: 1.0,
        timeSensitivity: 1.0,
        crossBorderRelevance: 1.0,
        precedentValue: 1.1,
        dataRichness: 1.0,
      };
    } else {
      // TIER_3/4: weight narrative and time sensitivity higher
      weights = {
        marketImpact: 1.0,
        regulatorySignificance: 0.9,
        institutionalRelevance: 1.0,
        technicalImportance: 1.0,
        narrativeStrength: 1.3,
        timeSensitivity: 1.2,
        crossBorderRelevance: 0.9,
        precedentValue: 1.0,
        dataRichness: 0.9,
      };
    }

    let weightedSum = 0;
    let totalWeight = 0;

    for (const [key, weight] of Object.entries(weights)) {
      const score = scores[key as keyof SignalScores] || 0;
      weightedSum += score * weight;
      totalWeight += weight;
    }

    const overall = weightedSum / totalWeight;
    return Math.round(overall * 10) / 10; // Round to 1 decimal
  }

  /**
   * Validate and clamp all scores to 1-10 range.
   */
  private validateScores(scores: SignalScores): SignalScores {
    const clamp = (n: number) => Math.min(10, Math.max(1, Math.round(n)));

    return {
      marketImpact: clamp(scores.marketImpact || 5),
      regulatorySignificance: clamp(scores.regulatorySignificance || 5),
      institutionalRelevance: clamp(scores.institutionalRelevance || 5),
      technicalImportance: clamp(scores.technicalImportance || 5),
      narrativeStrength: clamp(scores.narrativeStrength || 5),
      timeSensitivity: clamp(scores.timeSensitivity || 5),
      crossBorderRelevance: clamp(scores.crossBorderRelevance || 5),
      precedentValue: clamp(scores.precedentValue || 5),
      dataRichness: clamp(scores.dataRichness || 5),
    };
  }
}
