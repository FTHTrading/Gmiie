/**
 * Entity Profiler
 * ===============
 * Builds and maintains structured profiles for entities
 * (institutions, protocols, regulators, etc.)
 */

import { AIEngine } from './engine';
import { PromptManager } from './prompts';
import type { EntityProfile } from './types';

export class EntityProfiler {
  private engine: AIEngine;
  private prompts: PromptManager;

  constructor(engine: AIEngine, prompts?: PromptManager) {
    this.engine = engine;
    this.prompts = prompts || new PromptManager();
  }

  /**
   * Build or update an entity profile from recent coverage.
   */
  async buildProfile(params: {
    entityName: string;
    existingProfile?: EntityProfile;
    recentArticles: Array<{ title: string; summary: string; date: string }>;
  }): Promise<{ profile: EntityProfile; tokensUsed: number; durationMs: number }> {
    const systemPrompt = this.prompts.getSystemPrompt('build_entity_profile');

    const articlesText = params.recentArticles
      .map((a, i) => `${i + 1}. [${a.date}] ${a.title}\n   ${a.summary}`)
      .join('\n\n');

    const userPrompt = this.prompts.renderUserPrompt('build_entity_profile', {
      entityName: params.entityName,
      existingProfile: params.existingProfile
        ? JSON.stringify(params.existingProfile, null, 2)
        : 'No existing profile.',
      recentArticles: articlesText,
    });

    const { data, meta } = await this.engine.generateJSON<EntityProfile>({
      systemPrompt,
      userPrompt,
      temperature: 0.3,
      maxTokens: 3000,
    });

    return {
      profile: data,
      tokensUsed: meta.totalTokens,
      durationMs: meta.durationMs,
    };
  }
}
