/**
 * Newsletter Compilation Job Handler
 * ===================================
 * Compiles daily digests and weekly intelligence roundups
 * from the highest-scoring published articles.
 *
 * Delivers: HTML email + PDF attachment
 * DB Persistence: Queries published articles, creates newsletter Article.
 */

import type { Job } from 'bullmq';
import type { NewsletterJobData } from '../index';
import { prisma } from '@xxxiii/db';
import nodemailer from 'nodemailer';
import PDFDocument from 'pdfkit';

const SMTP_HOST = process.env.NEWSLETTER_SMTP_HOST;
const SMTP_PORT = Number.parseInt(process.env.NEWSLETTER_SMTP_PORT || '587', 10);
const SMTP_SECURE = process.env.NEWSLETTER_SMTP_SECURE === 'true';
const SMTP_USER = process.env.NEWSLETTER_SMTP_USER;
const SMTP_PASS = process.env.NEWSLETTER_SMTP_PASS;
const SMTP_FROM = process.env.NEWSLETTER_FROM || 'insights@xxxiii.io';
const BRIEFS_URL = 'https://xxxiii.io/briefs/';

function shouldSendEmail(): boolean {
  return Boolean(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

interface ArticleSummary {
  rank: number;
  title: string;
  score: number;
  topic: string;
  source: string;
  summary: string;
}

function buildPdfBuffer(params: {
  title: string;
  dateLabel: string;
  articles: ArticleSummary[];
}): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Header block
    doc
      .fillColor('#0a0a0a')
      .rect(0, 0, doc.page.width, 90)
      .fill();

    doc
      .fillColor('#ffffff')
      .fontSize(20)
      .font('Helvetica-Bold')
      .text('GMIIE', 50, 28, { continued: true })
      .fillColor('#4a9eff')
      .text(' — Global Monetary Infrastructure Intelligence Engine');

    doc
      .fillColor('#aaaaaa')
      .fontSize(9)
      .font('Helvetica')
      .text(params.dateLabel, 50, 58);

    doc.moveDown(3);

    // Title
    doc
      .fillColor('#111111')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text(params.title, { align: 'left' });

    doc
      .moveTo(50, doc.y + 6)
      .lineTo(doc.page.width - 50, doc.y + 6)
      .strokeColor('#4a9eff')
      .lineWidth(1.5)
      .stroke();

    doc.moveDown(1.5);

    // Articles
    for (const article of params.articles) {
      const scoreColor = article.score >= 75 ? '#16a34a' : article.score >= 50 ? '#ca8a04' : '#dc2626';

      doc
        .fillColor('#111111')
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(`${article.rank}. ${article.title}`, { lineGap: 2 });

      doc
        .fillColor(scoreColor)
        .fontSize(8)
        .font('Helvetica')
        .text(`Signal Score: ${article.score}/100`, { continued: true })
        .fillColor('#555555')
        .text(`   |   Topic: ${article.topic}   |   Source: ${article.source}`);

      doc.moveDown(0.3);

      if (article.summary) {
        doc
          .fillColor('#333333')
          .fontSize(9)
          .font('Helvetica')
          .text(article.summary, { lineGap: 3, width: doc.page.width - 100 });
      }

      doc
        .moveTo(50, doc.y + 8)
        .lineTo(doc.page.width - 50, doc.y + 8)
        .strokeColor('#e5e7eb')
        .lineWidth(0.5)
        .stroke();

      doc.moveDown(1.5);

      if (doc.y > doc.page.height - 120) {
        doc.addPage();
      }
    }

    // Footer
    doc
      .fontSize(8)
      .fillColor('#888888')
      .text(`View live intelligence at ${BRIEFS_URL}`, 50, doc.page.height - 60, { align: 'center' })
      .text('You are receiving this because you subscribed via xxxiii.io. Reply to unsubscribe.', { align: 'center' });

    doc.end();
  });
}

function buildHtmlEmail(params: {
  greeting: string;
  title: string;
  articles: ArticleSummary[];
  slug: string;
}): string {
  const articleRows = params.articles.map(a => {
    const scoreColor = a.score >= 75 ? '#16a34a' : a.score >= 50 ? '#ca8a04' : '#dc2626';
    return `
      <tr>
        <td style="padding:16px 0;border-bottom:1px solid #e5e7eb;">
          <div style="font-size:13px;font-weight:700;color:#111111;margin-bottom:4px;">${a.rank}. ${escapeHtml(a.title)}</div>
          <div style="font-size:11px;margin-bottom:6px;">
            <span style="color:${scoreColor};font-weight:600;">Signal ${a.score}/100</span>
            <span style="color:#9ca3af;margin:0 6px;">|</span>
            <span style="color:#6b7280;">${escapeHtml(a.topic)}</span>
            <span style="color:#9ca3af;margin:0 6px;">|</span>
            <span style="color:#6b7280;">${escapeHtml(a.source)}</span>
          </div>
          <div style="font-size:12px;color:#374151;line-height:1.6;">${escapeHtml(a.summary)}</div>
        </td>
      </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">

        <!-- Header -->
        <tr><td style="background:#0a0a0a;padding:24px 32px;">
          <div style="font-size:18px;font-weight:700;color:#ffffff;">
            GMIIE <span style="color:#4a9eff;">Intelligence Engine</span>
          </div>
          <div style="font-size:11px;color:#9ca3af;margin-top:4px;">Global Monetary Infrastructure — Macro Situational Awareness</div>
        </td></tr>

        <!-- Title -->
        <tr><td style="padding:24px 32px 0;">
          <div style="font-size:15px;color:#6b7280;margin-bottom:4px;">${params.greeting}</div>
          <h1 style="margin:8px 0 4px;font-size:20px;font-weight:700;color:#111111;">${escapeHtml(params.title)}</h1>
          <div style="height:2px;background:linear-gradient(90deg,#4a9eff,#0ea5e9);border-radius:2px;margin-top:12px;"></div>
        </td></tr>

        <!-- Articles -->
        <tr><td style="padding:8px 32px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${articleRows}
          </table>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:16px 32px 32px;text-align:center;">
          <a href="${BRIEFS_URL}" style="display:inline-block;background:#4a9eff;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:6px;font-size:13px;font-weight:600;">
            View All Intelligence Briefs →
          </a>
          <div style="margin-top:12px;font-size:11px;color:#9ca3af;">
            A PDF copy of this briefing is attached.
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;text-align:center;">
          <div style="font-size:11px;color:#9ca3af;">
            You subscribed at xxxiii.io. To change your preferences, re-subscribe with updated settings.
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function sendDigestEmail(params: {
  to: string;
  name?: string | null;
  subject: string;
  articles: ArticleSummary[];
  digestText: string;
  slug: string;
  title: string;
  dateLabel: string;
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

  const [htmlBody, pdfBuffer] = await Promise.all([
    Promise.resolve(buildHtmlEmail({
      greeting,
      title: params.title,
      articles: params.articles,
      slug: params.slug,
    })),
    buildPdfBuffer({
      title: params.title,
      dateLabel: params.dateLabel,
      articles: params.articles,
    }),
  ]);

  const pdfFilename = `gmiie-digest-${params.slug}.pdf`;

  await transport.sendMail({
    from: SMTP_FROM,
    to: params.to,
    subject: params.subject,
    text: `${greeting}\n\n${params.digestText}\n\nView all briefs: ${BRIEFS_URL}\n\nTo change preferences, re-subscribe at xxxiii.io.`,
    html: htmlBody,
    attachments: [
      {
        filename: pdfFilename,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
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

  // Build structured article list for HTML/PDF rendering
  const articleSummaries: ArticleSummary[] = topArticles.map((a, i) => ({
    rank: i + 1,
    title: a.headline || a.title,
    score: Math.round(a.signals[0]?.overallScore ?? a.importanceScore ?? 0),
    topic: a.topics[0]?.topic?.name || 'General',
    source: a.source?.name || 'Unknown',
    summary: a.executiveSummary || a.content?.substring(0, 280) || '',
  }));

  // Plain-text fallback
  const digestContent = articleSummaries.map(a =>
    `${a.rank}. ${a.title}\nSignal: ${a.score}/100 | ${a.topic} | ${a.source}\n\n${a.summary}\n\n---`
  ).join('\n\n');

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

  const dateLabel = from.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  let delivered = 0;
  let failed = 0;

  for (const sub of subscribers) {
    try {
      await sendDigestEmail({
        to: sub.email,
        name: sub.name,
        subject: finalTitle,
        articles: articleSummaries,
        digestText: digestContent,
        slug,
        title: finalTitle,
        dateLabel,
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
