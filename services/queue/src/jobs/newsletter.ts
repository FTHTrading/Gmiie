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
import { prisma } from '@xxxiii/db';
import nodemailer from 'nodemailer';

const SMTP_HOST = process.env.NEWSLETTER_SMTP_HOST;
const SMTP_PORT = Number.parseInt(process.env.NEWSLETTER_SMTP_PORT || '587', 10);
const SMTP_SECURE = process.env.NEWSLETTER_SMTP_SECURE === 'true';
const SMTP_USER = process.env.NEWSLETTER_SMTP_USER;
const SMTP_PASS = process.env.NEWSLETTER_SMTP_PASS;
const SMTP_FROM = process.env.NEWSLETTER_FROM || 'insights@xxxiii.io';

function shouldSendEmail(): boolean {
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

async function sendDigestEmail(params: {
  to: string;
  name?: string | null;
  subject: string;
  digestText: string;
  slug: string;
}): Promise<void> {
  if (!shouldSendEmail()) return;

  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  const greeting = params.name ? `Hi ${params.name},` : 'Hello,';
  const url = `https://xxxiii.io/intelligence/${params.slug}`;

  await transport.sendMail({
    from: SMTP_FROM,
    to: params.to,
    subject: params.subject,
    text: `${greeting}\n\n${params.digestText}\n\nRead online: ${url}\n\nManage your preferences anytime by re-subscribing with updated options.`,
  });
}

export async function handleNewsletter(job: Job<NewsletterJobData>): Promise<any> {
  const { type, dateRange, edition } = job.data;

  job.updateProgress(10);

  // Calculate date range
  const now = new Date();
  let from = dateRange?.from
    ? new Date(dateRange.from)
    : type === 'daily'
      ? new Date(now.getTime() - 24 * 60 * 60 * 1000)
      : new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const to = dateRange?.to ? new Date(dateRange.to) : now;

  job.updateProgress(20);

  // Fetch top published articles from DB
  let topArticles = await prisma.article.findMany({
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

  // If no fresh content in the default window, backfill from the prior 72h.
  if (type === 'daily' && topArticles.length === 0) {
    from = new Date(now.getTime() - 72 * 60 * 60 * 1000);
    topArticles = await prisma.article.findMany({
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
      take: 10,
    });
  }

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
    ? `daily-intelligence-digest-${slugDate}${edition ? `-${edition}` : ''}`
    : `weekly-intelligence-roundup-${slugDate}`;

  const title = type === 'daily'
    ? `GMIIE Daily Intelligence Digest — ${from.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`
    : `GMIIE Weekly Intelligence Roundup — Week of ${from.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`;
  const finalTitle = edition && type === 'daily' ? `${title} (${edition.toUpperCase()})` : title;

  // Check if digest already exists
  const existing = await prisma.article.findFirst({ where: { slug } });
  if (!existing) {
    await prisma.article.create({
      data: {
        title: finalTitle,
        headline: finalTitle,
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

  const subscribers = await prisma.newsletterSubscriber.findMany({
    where: {
      isActive: true,
      OR: [
        { cadence: 'DAILY' },
        ...(type === 'daily' && edition ? [{ cadence: 'TWICE_DAILY' as const }] : []),
        ...(type === 'weekly' ? [{ cadence: 'WEEKLY' as const }] : []),
      ],
    },
    select: {
      email: true,
      name: true,
    },
  });

  let delivered = 0;
  let failed = 0;

  for (const sub of subscribers) {
    try {
      await sendDigestEmail({
        to: sub.email,
        name: sub.name,
        subject: finalTitle,
        digestText: digestContent,
        slug,
      });
      delivered += 1;
    } catch {
      failed += 1;
    }
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
        edition: edition || null,
        delivered,
        failed,
      },
      completedAt: new Date(),
    },
  });

  job.updateProgress(100);

  return {
    type,
    edition: edition || null,
    articleCount: topArticles.length,
    slug,
    delivered,
    failed,
    status: 'compiled',
    compiledAt: new Date().toISOString(),
  };
}
