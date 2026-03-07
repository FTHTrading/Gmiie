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
  if (!article.slug) issues.push('Missing slug');
  if (!article.metaTitle) issues.push('Missing SEO title');
  if (!article.metaDescription) issues.push('Missing meta description');

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
