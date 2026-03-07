/**
 * AI Engine Core
 * ==============
 * Central AI processing engine — handles API calls to OpenAI/Anthropic,
 * token management, error handling, and response parsing.
 */

import OpenAI from 'openai';
import type { AIConfig, GenerationResult } from './types';

const DEFAULT_CONFIG: AIConfig = {
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
  defaultModel: 'gpt-4o',
  fallbackModel: 'gpt-4o-mini',
  temperature: 0.3,
  maxTokens: 4000,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
};

export class AIEngine {
  private openai: OpenAI;
  private config: AIConfig;

  constructor(config?: Partial<AIConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.openai = new OpenAI({
      apiKey: this.config.openaiApiKey,
    });
  }

  /**
   * Generate a completion using the configured model.
   */
  async generate(params: {
    systemPrompt: string;
    userPrompt: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    jsonMode?: boolean;
  }): Promise<GenerationResult> {
    const model = params.model || this.config.defaultModel;
    const startTime = Date.now();

    try {
      const response = await this.openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: params.systemPrompt },
          { role: 'user', content: params.userPrompt },
        ],
        temperature: params.temperature ?? this.config.temperature,
        max_tokens: params.maxTokens ?? this.config.maxTokens,
        top_p: this.config.topP,
        frequency_penalty: this.config.frequencyPenalty,
        presence_penalty: this.config.presencePenalty,
        response_format: params.jsonMode ? { type: 'json_object' } : undefined,
      });

      const choice = response.choices[0];
      const durationMs = Date.now() - startTime;

      return {
        content: choice?.message?.content || '',
        model: response.model,
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0,
        durationMs,
        finishReason: choice?.finish_reason || 'unknown',
      };
    } catch (error: any) {
      // Retry with fallback model
      if (model !== this.config.fallbackModel) {
        console.warn(`Primary model ${model} failed, retrying with ${this.config.fallbackModel}:`, error.message);
        return this.generate({
          ...params,
          model: this.config.fallbackModel,
        });
      }
      throw error;
    }
  }

  /**
   * Generate and parse JSON response.
   */
  async generateJSON<T = any>(params: {
    systemPrompt: string;
    userPrompt: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }): Promise<{ data: T; meta: Omit<GenerationResult, 'content'> }> {
    const result = await this.generate({
      ...params,
      jsonMode: true,
    });

    try {
      const data = JSON.parse(result.content) as T;
      const { content, ...meta } = result;
      return { data, meta };
    } catch {
      throw new Error(`Failed to parse AI response as JSON: ${result.content.substring(0, 200)}`);
    }
  }

  /**
   * Estimate token count for a string.
   */
  estimateTokens(text: string): number {
    // Rough estimation: ~4 chars per token for English
    return Math.ceil(text.length / 4);
  }

  /**
   * Check if content fits within model context window.
   */
  checkContextFit(systemPrompt: string, userPrompt: string, maxResponseTokens: number): boolean {
    const contextLimits: Record<string, number> = {
      'gpt-4o': 128000,
      'gpt-4o-mini': 128000,
      'gpt-4-turbo': 128000,
      'gpt-4': 8192,
      'gpt-3.5-turbo': 16384,
    };

    const limit = contextLimits[this.config.defaultModel] || 128000;
    const inputTokens = this.estimateTokens(systemPrompt) + this.estimateTokens(userPrompt);
    return (inputTokens + maxResponseTokens) < limit;
  }
}
