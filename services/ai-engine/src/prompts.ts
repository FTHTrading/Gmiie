/**
 * Prompt Manager
 * ==============
 * Central prompt registry. Individual prompts are defined in
 * modular files under ./prompts/ and re-exported here.
 *
 * Prompt modules:
 *   prompts/classify.ts      — News intelligence classification
 *   prompts/score.ts         — 9-dimension signal scoring
 *   prompts/write-article.ts — Briefs, analyses, deep dives, entity profiles
 *   prompts/seo.ts           — SEO + GEO optimization (titles, descriptions, FAQs)
 *   prompts/digest.ts        — Daily digest & weekly intelligence brief
 */

import type { PromptTemplate, PromptCategory } from './types';

// Import all prompts from modular files
import { classify_article } from './prompts/classify';
import { score_signal } from './prompts/score';
import {
  write_brief,
  write_analysis,
  write_deep_dive,
  summarize,
  build_entity_profile,
} from './prompts/write-article';
import {
  generate_seo_title,
  generate_meta_description,
  generate_faqs,
} from './prompts/seo';
import {
  compile_newsletter,
  write_daily_digest,
} from './prompts/digest';
import { truth_engine_analyze } from './prompts/truth-engine';
import { predict_impact } from './prompts/predict-impact';
import {
  intake_analyze,
  write_quick_facts,
  write_explained,
} from './prompts/intake-analyzer';
import {
  translate_article,
  detect_and_normalize,
} from './prompts/translate';
import { extract_entities } from './prompts/extract-entities';
import { write_narration } from './prompts/narrate';

// ─── PROMPT LIBRARY ──────────────────────────────────────────────

export const PROMPT_LIBRARY: Record<string, PromptTemplate> = {
  classify_article,
  score_signal,
  write_brief,
  write_analysis,
  write_deep_dive,
  summarize,
  build_entity_profile,
  generate_seo_title,
  generate_meta_description,
  generate_faqs,
  compile_newsletter,
  write_daily_digest,
  truth_engine_analyze,
  predict_impact,
  intake_analyze,
  write_quick_facts,
  write_explained,
  translate_article,
  detect_and_normalize,
  extract_entities,
  write_narration,
export class PromptManager {
  private overrides: Map<string, Partial<PromptTemplate>> = new Map();

  /**
   * Get a prompt template by name, with any overrides applied.
   */
  getPrompt(name: string): PromptTemplate {
    const base = PROMPT_LIBRARY[name];
    if (!base) {
      throw new Error(`Prompt template not found: ${name}`);
    }

    const override = this.overrides.get(name);
    if (override) {
      return { ...base, ...override };
    }

    return base;
  }

  /**
   * Render a user prompt with variable substitution.
   */
  renderUserPrompt(name: string, variables: Record<string, string>): string {
    const template = this.getPrompt(name);
    let rendered = template.userPromptTemplate;

    for (const [key, value] of Object.entries(variables)) {
      rendered = rendered.replaceAll(`{{${key}}}`, value);
    }

    return rendered;
  }

  /**
   * Get system prompt for a template.
   */
  getSystemPrompt(name: string): string {
    return this.getPrompt(name).systemPrompt;
  }

  /**
   * Override a prompt template (for A/B testing, tuning).
   */
  setOverride(name: string, override: Partial<PromptTemplate>): void {
    this.overrides.set(name, override);
  }

  /**
   * List all available prompts.
   */
  listPrompts(): Array<{ name: string; description: string; category: string; model: string }> {
    return Object.entries(PROMPT_LIBRARY).map(([name, template]) => ({
      name,
      description: template.description,
      category: template.category,
      model: template.model,
    }));
  }

  /**
   * List prompts by category.
   */
  getByCategory(category: PromptCategory): PromptTemplate[] {
    return Object.values(PROMPT_LIBRARY).filter(p => p.category === category);
  }
}

export type { PromptCategory } from './types';
