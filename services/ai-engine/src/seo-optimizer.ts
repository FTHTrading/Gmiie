/**
 * SEO Optimizer
 * =============
 * AI-powered SEO optimization: titles, meta descriptions, and FAQs.
 */

import { AIEngine } from './engine';
import { PromptManager } from './prompts';
import type { FAQ } from './types';

export class SEOOptimizer {
  private engine: AIEngine;
  private prompts: PromptManager;

  constructor(engine: AIEngine, prompts?: PromptManager) {
    this.engine = engine;
    this.prompts = prompts || new PromptManager();
  }

  /**
   * Generate SEO-optimized title.
   */
  async generateTitle(params: {
    title: string;
    primaryTopic: string;
    entities: string;
    summary: string;
  }): Promise<{ seoTitle: string; alternatives: string[]; targetKeyword: string }> {
    const systemPrompt = this.prompts.getSystemPrompt('generate_seo_title');
    const userPrompt = this.prompts.renderUserPrompt('generate_seo_title', params);

    const { data } = await this.engine.generateJSON<{
      seoTitle: string;
      alternatives: string[];
      targetKeyword: string;
    }>({
      systemPrompt,
      userPrompt,
      temperature: 0.4,
      maxTokens: 500,
    });

    return data;
  }

  /**
   * Generate SEO meta description.
   */
  async generateMetaDescription(params: {
    title: string;
    primaryTopic: string;
    summary: string;
    targetKeyword: string;
  }): Promise<{ metaDescription: string; alternative: string }> {
    const systemPrompt = this.prompts.getSystemPrompt('generate_meta_description');
    const userPrompt = this.prompts.renderUserPrompt('generate_meta_description', params);

    const { data } = await this.engine.generateJSON<{
      metaDescription: string;
      alternative: string;
    }>({
      systemPrompt,
      userPrompt,
      temperature: 0.3,
      maxTokens: 500,
    });

    return data;
  }

  /**
   * Generate FAQ section for JSON-LD structured data.
   */
  async generateFAQs(params: {
    title: string;
    primaryTopic: string;
    summary: string;
    keyPoints: string;
  }): Promise<{ faqs: FAQ[] }> {
    const systemPrompt = this.prompts.getSystemPrompt('generate_faqs');
    const userPrompt = this.prompts.renderUserPrompt('generate_faqs', params);

    const { data } = await this.engine.generateJSON<{ faqs: FAQ[] }>({
      systemPrompt,
      userPrompt,
      temperature: 0.3,
      maxTokens: 2000,
    });

    return data;
  }

  /**
   * Full SEO optimization pass for an article.
   */
  async optimizeArticle(params: {
    title: string;
    primaryTopic: string;
    entities: string;
    summary: string;
    keyPoints: string;
  }): Promise<{
    seoTitle: string;
    metaDescription: string;
    faqs: FAQ[];
    targetKeyword: string;
  }> {
    // Run title and meta description in sequence (meta needs keyword from title)
    const titleResult = await this.generateTitle(params);

    const metaResult = await this.generateMetaDescription({
      title: params.title,
      primaryTopic: params.primaryTopic,
      summary: params.summary,
      targetKeyword: titleResult.targetKeyword,
    });

    const faqResult = await this.generateFAQs({
      title: params.title,
      primaryTopic: params.primaryTopic,
      summary: params.summary,
      keyPoints: params.keyPoints,
    });

    return {
      seoTitle: titleResult.seoTitle,
      metaDescription: metaResult.metaDescription,
      faqs: faqResult.faqs,
      targetKeyword: titleResult.targetKeyword,
    };
  }
}
