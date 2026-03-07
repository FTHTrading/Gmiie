/**
 * Newsletter Compilation Job Handler
 * ===================================
 * Compiles daily digests and weekly intelligence roundups
 * from the highest-scoring published articles.
 *
 * DB Persistence: Queries published articles, creates newsletter Article.
 */

import type { Job } from 'bullmq';
import type { NewsletterJobData } from '../index';
import { AIEngine, Writer } from '@xxxiii/ai-engine';
import { prisma } from '@xxxiii/db';

export async function handleNewsletter(job: Job<NewsletterJobData>): Promise<any> {
  const { type, dateRange } = job.data;

  job.updateProgress(10);

  // Calculate date range
  const now = new Date();
  const from = dateRange.from
    ? new Date(dateRange.from)
    : type === 'daily'
      ? new Date(now.getTime() - 24 * 60 * 60 * 1000)
      : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const to = dateRange.to ? new Date(dateRange.to) : now;

  job.updateProgress(20);

  // Fetch top published articles from DB
  const topArticles = await prisma.article.findMany({
    where: {
      status: 'PUBLISHED',
      publishedAt: { gte: from, lte: to },
    },
    include: {
      signals: { orderBy: { overallScore: 'desc' }, take: 1 },
      topics: { include: { topic: true } },
      source: { select: { name: true, credibilityTier: true } },
    },
    orderBy: { importanceScore: 'desc' },
    take: type === 'daily' ? 10 : 25,
  });

  job.updateProgress(40);

  if (topArticles.length === 0) {
    await prisma.jobLog.create({
      data: {
        jobType: `newsletter_${type}`,
        status: 'COMPLETED',
        metadata: { articleCount: 0, reason: 'No articles in date range' },
        completedAt: new Date(),
      },
    });
    return { type, articleCount: 0, status: 'skipped_no_articles' };
  }

  // Format articles for digest
  const digestContent = topArticles.map((a, i) => {
    const score = a.signals[0]?.overallScore || a.importanceScore || 0;
    const topic = a.topics[0]?.topic?.name || 'General';
    return `## ${i + 1}. ${a.headline || a.title}\n\n**Signal Score:** ${score}/100 | **Topic:** ${topic} | **Source:** ${a.source?.name || 'Unknown'}\n\n${a.executiveSummary || a.content?.substring(0, 300) || ''}\n\n---`;
  }).join('\n\n');

  job.updateProgress(60);

  // Create the newsletter as a digest article
  const slugDate = from.toISOString().split('T')[0];
  const slug = type === 'daily'
    ? `daily-intelligence-digest-${slugDate}`
    : `weekly-intelligence-roundup-${slugDate}`;

  const title = type === 'daily'
    ? `GMIIE Daily Intelligence Digest — ${from.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
    : `GMIIE Weekly Intelligence Roundup — Week of ${from.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;

  // Check if digest already exists
  const existing = await prisma.article.findFirst({ where: { slug } });
  if (!existing) {
    await prisma.article.create({
      data: {
        title,
        headline: title,
        slug,
        canonicalHash: `digest-${type}-${slugDate}`,
        content: digestContent,
        executiveSummary: `${type === 'daily' ? 'Daily' : 'Weekly'} roundup of the top ${topArticles.length} intelligence items across tokenized securities and capital markets.`,
        articleType: type === 'daily' ? 'DAILY_DIGEST' : 'WEEKLY_ROUNDUP',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        importanceScore: 8,
      },
    });
  }

  job.updateProgress(90);

  await prisma.jobLog.create({
    data: {
      jobType: `newsletter_${type}`,
      status: 'COMPLETED',
      metadata: {
        articleCount: topArticles.length,
        dateRange: { from: from.toISOString(), to: to.toISOString() },
        digestSlug: slug,
      },
      completedAt: new Date(),
    },
  });

  job.updateProgress(100);

  return {
    type,
    articleCount: topArticles.length,
    slug,
    status: 'compiled',
    compiledAt: new Date().toISOString(),
  };
}
