/**
 * Publish Job Handler
 * ====================
 * Handles the final publication step:
 * - Loads article from database with all enrichments
 * - Validates all required fields
 * - Generates final slug if not set
 * - Transitions article status to PUBLISHED or REVIEW
 * - Triggers sitemap regeneration
 *
 * DB Persistence: Full — loads, validates, and transitions article status.
 */

import type { Job } from 'bullmq';
import type { PublishJobData } from '../index';
import { getQueue, QUEUE_NAMES } from '../index';
import { prisma } from '@xxxiii/db';

const REVALIDATE_URLS = (process.env.REVALIDATE_ENDPOINTS || '')
  .split(',')
  .map((v) => v.trim())
  .filter(Boolean);

async function triggerRevalidation(): Promise<void> {
  if (REVALIDATE_URLS.length === 0) return;

  const token = process.env.REVALIDATION_TOKEN;
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  await Promise.allSettled(
    REVALIDATE_URLS.map((url) =>
      fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          paths: ['/', '/intelligence', '/signals', '/timeline', '/methodology'],
        }),
      }),
    ),
  );
}

export async function handlePublish(job: Job<PublishJobData>): Promise<any> {
  const { articleId, autoPublish } = job.data;

  job.updateProgress(10);

  // Load full article from DB
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    include: {
      source: true,
      signals: { orderBy: { generatedAt: 'desc' }, take: 1 },
      topics: { include: { topic: true } },
      entities: { include: { entity: true } },
      tags: { include: { tag: true } },
    },
  });

  if (!article) {
    throw new Error(`Article ${articleId} not found`);
  }

  job.updateProgress(20);

  // Validate completeness
  const issues: string[] = [];
  if (!article.title && !article.headline) issues.push('Missing title/headline');
  if (!article.content || article.content.length < 100) issues.push('Content too short or missing');

  const computedMetaTitle = article.metaTitle || article.headline || article.title || '';
  const computedMetaDescription =
    article.metaDescription ||
    article.executiveSummary ||
    (article.content ? article.content.replace(/\s+/g, ' ').slice(0, 160) : '');

  // Generate slug if missing
  let slug = article.slug;
  if (!slug && (article.headline || article.title)) {
    slug = (article.headline || article.title)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 80);

    // Ensure uniqueness
    const existing = await prisma.article.findFirst({
      where: { slug, id: { not: articleId } },
    });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }
  }

  job.updateProgress(40);

  const newStatus = autoPublish && issues.length === 0 ? 'PUBLISHED' : 'REVIEW';
  const publishedAt = newStatus === 'PUBLISHED' ? new Date() : null;

  // Transition article status
  await prisma.article.update({
    where: { id: articleId },
    data: {
      status: newStatus,
      ...(slug ? { slug } : {}),
      ...(computedMetaTitle ? { metaTitle: computedMetaTitle } : {}),
      ...(computedMetaDescription ? { metaDescription: computedMetaDescription } : {}),
      ...(publishedAt ? { publishedAt } : {}),
    },
  });

  job.updateProgress(70);

  // Log the publication event
  await prisma.jobLog.create({
    data: {
      jobType: 'publish',
      status: 'COMPLETED',
      sourceId: articleId,
      metadata: {
        newStatus,
        autoPublish,
        validationIssues: issues,
        slug,
        publishedAt: publishedAt?.toISOString() || null,
        signalScore: article.signals[0]?.overallScore || null,
      },
      completedAt: new Date(),
    },
  });

  // Create audit log
  await prisma.auditLog.create({
    data: {
      action: newStatus === 'PUBLISHED' ? 'article.publish' : 'article.review',
      targetType: 'Article',
      targetId: articleId,
      metadata: {
        title: article.headline || article.title,
        slug,
        autoPublish,
        validationIssues: issues,
      },
    },
  });

  job.updateProgress(85);

  // Trigger sitemap regeneration after publish
  if (newStatus === 'PUBLISHED') {
    const sitemapQueue = getQueue(QUEUE_NAMES.SITEMAP);
    await sitemapQueue.add('news-sitemap', {
      type: 'news',
    });

    await triggerRevalidation();

    // Dispatch translation job for all supported languages
    // Only translate English-language articles (avoid re-translating translations)
    if (article.language === 'en' || !article.language) {
      const translateQueue = getQueue(QUEUE_NAMES.TRANSLATE);
      await translateQueue.add(
        'translate-article',
        {
          articleId,
          title: article.headline || article.title || '',
          subtitle: article.dek || '',
          summary: article.executiveSummary || '',
          body: article.content || '',
          keyPoints: [],
          gmiieSignal: '',
          slug: slug || article.slug || '',
        },
        {
          // Delay 60s to avoid hammering AI right after draft/seo jobs
          delay: 60_000,
          attempts: 2,
          backoff: { type: 'exponential', delay: 30_000 },
        },
      );
    }
  }

  job.updateProgress(100);

  return {
    articleId,
    status: newStatus,
    slug,
    publishedAt: publishedAt?.toISOString() || null,
    validationPassed: issues.length === 0,
    issues,
  };
}
