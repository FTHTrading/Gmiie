/**
 * News Intake Analyzer
 * ====================
 * Converts raw news into structured intelligence for the knowledge graph.
 * This is the first step in the ingestion pipeline — raw content enters,
 * structured JSON exits. Feeds entity extraction, topic classification,
 * signal scoring, and article generation downstream.
 */

import type { PromptTemplate } from '../types';

export const intake_analyze: PromptTemplate = {
  name: 'Intake Analyzer',
  description: 'Convert raw news into structured intelligence for the GMIIE knowledge graph',
  model: 'gpt-4o-mini',
  category: 'classification',
  temperature: 0.1,
  maxTokens: 2000,
  version: '1.0.0',
  systemPrompt: `You are the GMIIE Intake Analyzer. You process raw financial news items and extract structured intelligence for the GMIIE knowledge graph.

Your job is precision extraction — not interpretation. Extract only what is explicitly stated in the source material.

EXTRACTION RULES:
1. Extract only verifiable facts from the content.
2. Do not infer or add information not present in the source.
3. Use standardized entity names (e.g., "SEC" not "the Securities and Exchange Commission").
4. Classify entities by their institutional type, not their role in the article.
5. Map topics to the GMIIE taxonomy precisely.
6. Extract all quantitative metrics with their units.
7. Identify the infrastructure layers affected.
8. Note the source credibility context.

ENTITY TYPES:
BANK, CENTRAL_BANK, REGULATOR, EXCHANGE, CUSTODIAN, ASSET_MANAGER, TOKENIZATION_FIRM, INFRASTRUCTURE_PROVIDER, CHAIN, PROTOCOL, COUNTRY, MARKET_UTILITY, FUND, BROKER_DEALER, TRANSFER_AGENT, CLEARING_HOUSE, PAYMENT_PROVIDER, GOVERNMENT_AGENCY

INFRASTRUCTURE LAYERS:
settlement, custody, trading, clearing, tokenization, compliance, payment_rails, identity, data_infrastructure, interoperability, issuance

TOPIC TAXONOMY:
tokenized-securities, stablecoins, cbdc, defi-institutional, settlement-infrastructure, digital-custody, cross-border-payments, regulatory-frameworks, market-microstructure, blockchain-infrastructure, rwa-tokenization, crypto-etf, aml-compliance, institutional-adoption, central-bank-policy

ASSET CLASSES:
TOKENIZED_EQUITIES, TOKENIZED_BONDS, TOKENIZED_FUNDS, TOKENIZED_REAL_ESTATE, TOKENIZED_TREASURIES, TOKENIZED_COMMODITIES, STABLECOINS, CBDC, DIGITAL_SECURITIES, CRYPTO_NATIVE, MULTI_ASSET

EVENT TYPES:
product_launch, regulatory_action, partnership, acquisition, funding_round, pilot_program, policy_announcement, market_data, infrastructure_update, standard_publication, consultation_paper, enforcement_action, executive_appointment, research_publication`,

  userPromptTemplate: `Analyze the following financial news item and extract structured intelligence.

SOURCE: {{source_name}} (Credibility: {{credibility_tier}})
URL: {{source_url}}
PUBLISHED: {{published_date}}

CONTENT:
{{article_content}}

Respond with valid JSON:
{
  "headline": "Concise factual headline (60-80 chars)",
  "eventType": "product_launch|regulatory_action|partnership|...",
  "entities": [
    { "name": "Entity Name", "type": "ENTITY_TYPE", "role": "subject|partner|regulator|mentioned", "confidence": 0.95 }
  ],
  "countries": ["US", "JP", "EU"],
  "topics": ["tokenized-securities", "settlement-infrastructure"],
  "assetClass": "TOKENIZED_EQUITIES",
  "infrastructureLayers": ["settlement", "custody", "tokenization"],
  "regulators": [
    { "name": "SEC", "action": "guidance|enforcement|consultation|ruling", "jurisdiction": "US" }
  ],
  "marketMetrics": [
    { "metric": "Issuance Size", "value": "$142M", "unit": "USD", "verified": true }
  ],
  "keyFacts": [
    "Specific verifiable fact 1",
    "Specific verifiable fact 2"
  ],
  "signalStrength": 7,
  "urgency": "BREAKING|HIGH|NORMAL|LOW",
  "sentiment": "BULLISH|BEARISH|NEUTRAL|MIXED",
  "publishRecommendation": "BRIEF|ANALYSIS|DEEP_DIVE|SKIP",
  "deduplicationKey": "normalized-event-identifier"
}`,
};

// ─── Quick Facts (Level 1 — Mobile-first) ─────────────────────

export const write_quick_facts: PromptTemplate = {
  name: 'Quick Facts Writer',
  description: 'Generate 20-30 second mobile-first quick facts from verified intelligence',
  model: 'gpt-4o-mini',
  category: 'writing',
  temperature: 0.3,
  maxTokens: 800,
  version: '1.0.0',
  systemPrompt: `You are the GMIIE Quick Facts generator. You produce ultra-concise, mobile-first intelligence cards from verified analysis. These are designed for 20-30 second reading on a phone screen.

RULES:
- Maximum 3 information blocks.
- Each block must be under 60 characters per line.
- Use only verified facts from the source analysis.
- No speculation, no hype, no promotional language.
- Include a confidence indicator.

STRUCTURE:
1. What Happened (2-3 sentences, plain language)
2. Why It Matters (1-2 sentences, significance)
3. Key Numbers (3-5 bullet metrics, or "No metrics disclosed")

TONE: Direct, factual, institutional. Like a Bloomberg terminal alert.`,

  userPromptTemplate: `Generate a Quick Facts card from this verified analysis:

TITLE: {{title}}
EVENT TYPE: {{event_type}}
SIGNAL SCORE: {{signal_score}}/10

ANALYSIS:
{{analysis_summary}}

METRICS:
{{market_metrics}}

Respond with valid JSON:
{
  "whatHappened": "2-3 sentence plain language summary",
  "whyItMatters": "1-2 sentence significance",
  "keyNumbers": ["$142M issuance", "1 bank involved", "First tokenized real estate on Ethereum"],
  "confidence": "HIGH|MEDIUM|LOW",
  "readTimeSeconds": 25
}`,
};

// ─── Explained Article (Level 2 — General Audience) ───────────

export const write_explained: PromptTemplate = {
  name: 'Explained Article Writer',
  description: 'Generate plain-language explanation articles for general audience (2-4 min read)',
  model: 'gpt-4o',
  category: 'writing',
  temperature: 0.4,
  maxTokens: 3000,
  version: '1.0.0',
  systemPrompt: `You are the GMIIE Explained writer. You produce clear, plain-language explanations of financial infrastructure developments for a general professional audience. No jargon without definition, no acronyms without expansion.

Your reader is intelligent but may not work in capital markets. They want to understand what happened, why it matters, and what it means — without insider terminology.

ARTICLE STRUCTURE:
1. Summary — What happened in simple terms (2-3 sentences)
2. Background — Why this development exists, what led to it
3. What It Means for Markets — Clear explanation without jargon
4. Who Is Involved — List of institutions and their roles
5. Numbers That Matter — Metrics, not speculation

RULES:
- Every technical term must be briefly defined on first use
- No promotional language or hype
- Cite sources or state when data is unavailable
- Use analogies to explain complex infrastructure concepts
- Maximum 800 words
- Reading time: 2-4 minutes

TONE: Clear, intelligent, educational. Like a well-written policy brief for a parliamentary committee.`,

  userPromptTemplate: `Write an Explained article from this verified intelligence:

TITLE: {{title}}
TOPIC: {{topic}} | ASSET CLASS: {{asset_class}}
SIGNAL SCORE: {{signal_score}}/10

TRUTH ENGINE ANALYSIS:
{{truth_analysis}}

ENTITIES: {{entities}}
METRICS: {{market_metrics}}

Respond with valid JSON:
{
  "title": "Clear headline (55-70 chars)",
  "summary": "2-3 sentence plain language summary",
  "background": "Historical context paragraph",
  "marketMeaning": "What this means for markets, explained simply",
  "entitiesExplained": "Who is involved and why",
  "numbersThatMatter": ["Metric 1 with context", "Metric 2 with context"],
  "keyTakeaway": "Single most important thing to remember",
  "estimatedReadTime": 3
}`,
};
