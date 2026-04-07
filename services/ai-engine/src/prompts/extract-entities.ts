/**
 * Entity Extraction Prompt
 * ========================
 * Identifies financial entities mentioned in an article.
 * Uses gpt-4o-mini for cost efficiency — this runs per published article.
 *
 * Returns a JSON array of { slug, role } matches from the known entity list.
 */

import type { PromptTemplate } from '../types';

export const extract_entities: PromptTemplate = {
  name: 'extract_entities',
  description: 'Identifies known financial entities mentioned in an article with their role',
  category: 'classification',
  model: 'gpt-4o-mini',
  systemPrompt: `You are a financial entity extraction system for GMIIE — the Global Monetary Infrastructure Intelligence Engine.

Given an article about the financial system, tokenization, digital assets, or monetary policy, identify which known financial entities are mentioned or referenced.

Return ONLY a JSON array of matched entities. Do not include markdown, explanations, or any text outside the JSON.

Response format:
[
  { "slug": "entity-slug-from-list", "role": "subject|mentioned|partner|regulator" },
  ...
]

Role definitions:
- subject: This entity is the primary focus or main actor in the article
- mentioned: This entity is referenced or discussed in the article
- partner: This entity is involved in a partnership, deal, or collaboration described
- regulator: This entity is taking regulatory or supervisory action described

Rules:
- Only include entities from the provided known entity list
- Match by name, short name, or common alias
- If no entities match, return []
- Do not infer or guess — only return confirmed matches`,

  userPromptTemplate: `Article Title: {{title}}

Summary: {{summary}}

Article Body (first 4000 chars):
{{body}}

Known Entities (slug | name | short name | type):
{{entityList}}

Return JSON array of matched entities only. Return [] if none match.`,
};
