/**
 * Translate Job Handler
 * =====================
 * After an English article is published, this job fans out translation
 * tasks across the configured target languages. Each language becomes
 * a separate Article row with:
 *   - language = "<code>"
 *   - slug = "<original-slug>-<code>"
 *   - eventFamily = original article's eventFamily (groups translations together)
 *   - status = PUBLISHED (translations publish automatically)
 *
 * DB Persistence: Full — creates one Article row per target language.
 */

import type { Job } from 'bullmq';
import type { TranslateJobData } from '../index';
import { prisma } from '@xxxiii/db';
import { AIEngine } from '@xxxiii/ai-engine/src/engine';
import { PromptManager } from '@xxxiii/ai-engine/src/prompts';
import { Writer } from '@xxxiii/ai-engine/src/writer';
import { SUPPORTED_LANGUAGES } from '@xxxiii/ai-engine/src/prompts/translate';
import { createHash } from 'crypto';

// Languages to translate into by default (excludes 'en' which is the source)
const DEFAULT_TARGET_LANGUAGES = ['zh', 'ja', 'de', 'fr', 'es', 'pt', 'ar', 'ko'];

const engine = new AIEngine();
const writer = new Writer(engine, new PromptManager());

export async function handleTranslate(job: Job<TranslateJobData>): Promise<any> {
  const {
    articleId,
    title,
    subtitle,
    summary,
    body,
    keyPoints,
    gmiieSignal,
    slug,
    targetLanguages,
  } = job.data;

  const targets = (targetLanguages ?? DEFAULT_TARGET_LANGUAGES).filter(
    (code) => code !== 'en' && SUPPORTED_LANGUAGES[code],
  );

  job.updateProgress(5);

  // Load the source article to get its eventFamily + sourceId
  const source = await prisma.article.findUnique({
    where: { id: articleId },
    select: {
      eventFamily: true,
      sourceId: true,
      authorId: true,
      assetClass: true,
      region: true,
      importanceScore: true,
      confidenceScore: true,
      publishedAt: true,
      topics: {
        select: { topicId: true, isPrimary: true },
      },
      entities: {
        select: { entityId: true, relevanceScore: true },
      },
    },
  });

  if (!source) {
    throw new Error(`Source article ${articleId} not found`);
  }

  const results: { lang: string; articleId: string }[] = [];
  const progressStep = Math.floor(90 / targets.length);
  let currentProgress = 5;

  for (const targetCode of targets) {
    const langMeta = SUPPORTED_LANGUAGES[targetCode];

    try {
      const { draft, tokensUsed } = await writer.translateArticle({
        articleId,
        title,
        subtitle,
        summary,
        body,
        keyPoints,
        gmiieSignal,
        targetCode,
        targetLanguage: langMeta.name,
      });

      const translatedSlug = `${slug}-${targetCode}`;
      const canonicalHash = createHash('sha256')
        .update(`${translatedSlug}|translation`)
        .digest('hex');

      // Check if translation already exists (idempotent)
      const existing = await prisma.article.findUnique({
        where: { slug: translatedSlug },
        select: { id: true },
      });

      if (existing) {
        // Update existing translation
        await prisma.article.update({
          where: { id: existing.id },
          data: {
            title: draft.title ?? title,
            headline: draft.subtitle,
            executiveSummary: draft.summary,
            content: draft.body ?? body,
            language: targetCode,
            status: 'PUBLISHED',
            updatedAt: new Date(),
          },
        });
        results.push({ lang: targetCode, articleId: existing.id });
      } else {
        // Create new translated article
        const created = await prisma.article.create({
          data: {
            slug: translatedSlug,
            canonicalHash,
            title: draft.title ?? title,
            headline: draft.subtitle,
            dek: subtitle,
            executiveSummary: draft.summary,
            content: draft.body ?? body,
            language: targetCode,
            articleType: 'BRIEF',
            status: 'PUBLISHED',
            assetClass: source.assetClass,
            region: source.region,
            eventFamily: source.eventFamily,
            sourceId: source.sourceId,
            authorId: source.authorId,
            importanceScore: source.importanceScore,
            confidenceScore: source.confidenceScore,
            publishedAt: source.publishedAt ?? new Date(),
            // Link same topics
            topics: {
              create: source.topics.map((t) => ({
                topicId: t.topicId,
                isPrimary: t.isPrimary ?? false,
              })),
            },
          },
        });
        results.push({ lang: targetCode, articleId: created.id });
      }

      currentProgress = Math.min(95, currentProgress + progressStep);
      job.updateProgress(currentProgress);

      job.log(`Translated to ${langMeta.name} (${targetCode}) — ${tokensUsed} tokens`);
    } catch (err) {
      // Non-fatal: log and continue with next language
      const msg = err instanceof Error ? err.message : String(err);
      job.log(`Translation to ${targetCode} failed: ${msg}`);
    }
  }

  job.updateProgress(100);

  return {
    sourceArticleId: articleId,
    translations: results,
    total: results.length,
    targeted: targets.length,
  };
}
