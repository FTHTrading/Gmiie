/**
 * Content Classifier
 * ==================
 * Classifies ingested content across topics, asset classes,
 * entities, urgency, and article type using AI.
 */

import { AIEngine } from './engine';
import { PromptManager } from './prompts';
import type { ClassificationResult } from './types';

export class Classifier {
  private engine: AIEngine;
  private prompts: PromptManager;

  constructor(engine: AIEngine, prompts?: PromptManager) {
    this.engine = engine;
    this.prompts = prompts || new PromptManager();
  }

  /**
   * Classify a piece of content.
   */
  async classify(params: {
    title: string;
    content: string;
    source: string;
    credibility: string;
  }): Promise<{ classification: ClassificationResult; tokensUsed: number; durationMs: number }> {
    const systemPrompt = this.prompts.getSystemPrompt('classify_article');
    const userPrompt = this.prompts.renderUserPrompt('classify_article', {
      title: params.title,
      source: params.source,
      credibility: params.credibility,
      content: params.content.substring(0, 8000), // Truncate for context window
    });

    const { data, meta } = await this.engine.generateJSON<ClassificationResult>({
      systemPrompt,
      userPrompt,
      temperature: 0.1,
      maxTokens: 2000,
    });

    return {
      classification: data,
      tokensUsed: meta.totalTokens,
      durationMs: meta.durationMs,
    };
  }

  /**
   * Batch classify multiple items.
   */
  async classifyBatch(
    items: Array<{ title: string; content: string; source: string; credibility: string }>,
  ): Promise<Array<{ classification: ClassificationResult; tokensUsed: number }>> {
    const results = [];
    for (const item of items) {
      try {
        const result = await this.classify(item);
        results.push(result);
      } catch (error) {
        console.error(`Classification failed for: ${item.title}`, error);
        results.push({
          classification: this.getDefaultClassification(),
          tokensUsed: 0,
          durationMs: 0,
        });
      }
    }
    return results;
  }

  private getDefaultClassification(): ClassificationResult {
    return {
      primaryTopic: 'tokenized-securities',
      secondaryTopics: [],
      topicCluster: 'tokenization',
      assetClass: 'NOT_APPLICABLE',
      entities: [],
      articleType: 'BRIEF',
      sentiment: 'NEUTRAL',
      urgency: 'NORMAL',
      confidence: 0,
      tags: [],
    };
  }
}
