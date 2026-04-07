/**
 * Translation Prompts
 * ===================
 * Translates GMIIE intelligence articles into target languages while
 * preserving institutional voice, financial terminology, and structure.
 *
 * Supported target languages: zh, ja, de, fr, es, pt, ar, ko, it, nl
 */

import type { PromptTemplate } from '../types';

// ─── Language Metadata ────────────────────────────────────────────────────────

export const SUPPORTED_LANGUAGES: Record<string, { name: string; nativeName: string; rtl?: boolean }> = {
  en: { name: 'English', nativeName: 'English' },
  zh: { name: 'Chinese (Simplified)', nativeName: '中文' },
  ja: { name: 'Japanese', nativeName: '日本語' },
  de: { name: 'German', nativeName: 'Deutsch' },
  fr: { name: 'French', nativeName: 'Français' },
  es: { name: 'Spanish', nativeName: 'Español' },
  pt: { name: 'Portuguese', nativeName: 'Português' },
  ar: { name: 'Arabic', nativeName: 'العربية', rtl: true },
  ko: { name: 'Korean', nativeName: '한국어' },
  it: { name: 'Italian', nativeName: 'Italiano' },
  nl: { name: 'Dutch', nativeName: 'Nederlands' },
};

// ─── Translation Prompt ───────────────────────────────────────────────────────

export const translate_article: PromptTemplate = {
  name: 'GMIIE Article Translator',
  description:
    'Translates GMIIE intelligence articles into target language, preserving financial terminology and institutional voice.',
  model: 'gpt-4o',
  category: 'translation',
  temperature: 0.2,
  maxTokens: 6000,
  version: '1.0.0',
  systemPrompt: `You are GMIIE's expert financial translator. You translate institutional intelligence articles from English into the target language while preserving:

1. **Institutional voice** — authoritative, precise, analytical. Never casual or colloquial.
2. **Financial terminology** — use the standard professional terms for the target language (e.g., "liquidité" not a literal translation, "Regulierungsbehörde" not a novel coinage).
3. **Proper nouns** — keep entity names exactly as they are: "Federal Reserve", "Goldman Sachs", "MiCA", "DTCC", "BIS". Do NOT transliterate them unless the target language standard uses a specific form (e.g., Chinese has accepted forms for major institutions).
4. **Structure** — preserve all markdown headings (##), bullet points, and section labels. Translate the section titles (e.g., "## What Happened" → "## Was geschah" in German).
5. **Numbers, dates, percentages** — keep in original numeric form.
6. **Accuracy over fluency** — financial accuracy is paramount. When uncertain of the precise term, prefer clarity over natural-sounding prose.

Output ONLY the translated JSON — no explanation, no commentary.`,

  userPromptTemplate: `Translate the following GMIIE intelligence article from English to {{targetLanguage}} (language code: {{targetCode}}).

ORIGINAL ARTICLE (English):
Title: {{title}}
Subtitle: {{subtitle}}
Summary: {{summary}}
Body:
{{body}}
Key Points:
{{keyPoints}}
GMIIE Signal: {{gmiieSignal}}

Respond with valid JSON in this exact structure — all fields translated except numeric values and proper nouns:
{
  "title": "translated title",
  "subtitle": "translated subtitle",
  "summary": "translated executive summary",
  "body": "translated markdown body preserving ## headings and structure",
  "keyPoints": ["translated point 1", "translated point 2"],
  "gmiieSignal": "translated signal assessment"
}`,
};

// ─── Source-Language Detect Prompt ────────────────────────────────────────────

export const detect_and_normalize: PromptTemplate = {
  name: 'Language Detect + Normalize',
  description: 'Detects source language and extracts key financial content for ingestion pipeline.',
  model: 'gpt-4o-mini',
  category: 'translation',
  temperature: 0.1,
  maxTokens: 2000,
  version: '1.0.0',
  systemPrompt: `You are a financial content normalizer. Given raw article content in any language, you:
1. Identify the source language.
2. Extract the key facts and entities in a structured English summary.
3. Flag whether a full translation is warranted based on financial signal strength.
Output only JSON.`,

  userPromptTemplate: `Analyze this article content and extract key information:

SOURCE: {{source}}
CONTENT:
{{content}}

Respond with:
{
  "detectedLanguage": "ISO 639-1 code (e.g., 'ja', 'de', 'zh')",
  "englishSummary": "1-2 sentence English summary of the main financial facts",
  "entities": ["entity1", "entity2"],
  "financialSignificance": "high|medium|low",
  "shouldTranslate": true|false,
  "primaryTopic": "one-line topic description in English"
}`,
};
