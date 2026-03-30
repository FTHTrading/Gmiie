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
const SMTP_FROM = process.env.NEWSLETTER_FROM || 'pulse@xxxiii.io';
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

    // Header block — Pulse brand: white background, deep navy accent bar
    doc
      .fillColor('#1a3a5c')
      .rect(0, 0, doc.page.width, 6)
      .fill();

    doc
      .fillColor('#f8f5f0')
      .rect(0, 6, doc.page.width, 80)
      .fill();

    doc
      .fillColor('#1a1a1a')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('GMIIE Pulse', 50, 22);

    doc
      .fillColor('#1a3a5c')
      .fontSize(9)
      .font('Helvetica')
      .text('Global Monetary Infrastructure Intelligence Engine', 50, 50);

    doc
      .fillColor('#6b6b6b')
      .fontSize(9)
      .font('Helvetica')
      .text(params.dateLabel, 50, 63);

    doc
      .moveTo(0, 86)
      .lineTo(doc.page.width, 86)
      .strokeColor('#d4cfc8')
      .lineWidth(0.5)
      .stroke();

    doc.moveDown(3);

    // Title
    doc
      .fillColor('#1a1a1a')
      .fontSize(16)
      .font('Helvetica-Bold')
      .text(params.title, { align: 'left' });

    doc
      .moveTo(50, doc.y + 6)
      .lineTo(doc.page.width - 50, doc.y + 6)
      .strokeColor('#1a3a5c')
      .lineWidth(1.5)
      .stroke();

    doc.moveDown(1.5);

    // Articles
    for (const article of params.articles) {
      const scoreColor = article.score >= 75 ? '#216b3e' : article.score >= 50 ? '#854d0e' : '#b91c1c';

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
      .fillColor('#6b6b6b')
      .text(`View full analysis at ${BRIEFS_URL}`, 50, doc.page.height - 60, { align: 'center' })
      .fillColor('#9ca3af')
      .text('You are receiving GMIIE Pulse because you subscribed at xxxiii.io. Reply to unsubscribe.', { align: 'center' });

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
    const scoreColor = a.score >= 75 ? '#216b3e' : a.score >= 50 ? '#854d0e' : '#b91c1c';
    const scoreBg   = a.score >= 75 ? '#dcfce7' : a.score >= 50 ? '#fef9c3' : '#fee2e2';
    const topicLabel = a.topic ? `<span style="font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#b8860b;">${escapeHtml(a.topic)}</span>` : '';
    return `
      <tr>
        <td style="padding:16px 0;border-bottom:1px solid #d4cfc8;">
          ${topicLabel ? `<div style="margin-bottom:5px;">${topicLabel}</div>` : ''}
          <div style="font-size:14px;font-weight:700;color:#1a1a1a;line-height:1.3;margin-bottom:6px;">${a.rank}. ${escapeHtml(a.title)}</div>
          <div style="font-size:12px;color:#3d3d3d;line-height:1.6;font-family:Georgia,'Times New Roman',Times,serif;margin-bottom:8px;">${escapeHtml(a.summary)}</div>
          <span style="display:inline-block;background:${scoreBg};color:${scoreColor};font-family:Helvetica,Arial,sans-serif;font-size:9px;font-weight:700;padding:2px 7px;letter-spacing:0.04em;">Signal ${a.score}/100</span>
          <span style="font-family:Helvetica,Arial,sans-serif;font-size:9px;color:#9ca3af;margin-left:8px;">${escapeHtml(a.source)}</span>
        </td>
      </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0ede8;font-family:Georgia,'Times New Roman',Times,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ede8;padding:32px 0;">
    <tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;overflow:hidden;border:1px solid #d4cfc8;">

        <!-- Accent bar -->
        <tr><td style="background:#1a3a5c;height:5px;font-size:0;line-height:0;">&nbsp;</td></tr>

        <!-- Masthead -->
        <tr><td style="background:#ffffff;padding:24px 36px 16px;border-bottom:3px double #1a1a1a;text-align:center;">
          <div style="font-family:Helvetica,Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.3em;color:#6b6b6b;text-transform:uppercase;margin-bottom:8px;">GMIIE &middot; Global Monetary Infrastructure Intelligence Engine</div>
          <div style="font-size:42px;font-weight:900;color:#1a1a1a;letter-spacing:-0.03em;line-height:1;">Pulse</div>
          <div style="font-family:Helvetica,Arial,sans-serif;font-size:10px;color:#6b6b6b;margin-top:6px;letter-spacing:0.1em;text-transform:uppercase;">The Cliff Notes on Capital Markets &amp; Monetary Policy</div>
        </td></tr>

        <!-- Date bar -->
        <tr><td style="background:#f8f5f0;padding:7px 36px;border-bottom:1px solid #d4cfc8;">
          <div style="font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#6b6b6b;">
            <span style="text-transform:uppercase;letter-spacing:0.06em;">${params.greeting}</span>
          </div>
        </td></tr>

        <!-- Edition title -->
        <tr><td style="padding:20px 36px 0;">
          <h1 style="margin:0 0 4px;font-size:20px;font-weight:900;color:#1a1a1a;line-height:1.2;">${escapeHtml(params.title)}</h1>
          <div style="height:2px;background:#1a3a5c;margin-top:12px;"></div>
        </td></tr>

        <!-- Articles -->
        <tr><td style="padding:8px 36px 16px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${articleRows}
          </table>
        </td></tr>

        <!-- CTA -->
        <tr><td style="padding:16px 36px 28px;text-align:center;border-top:1px solid #d4cfc8;">
          <a href="${BRIEFS_URL}" style="display:inline-block;background:#1a3a5c;color:#ffffff;text-decoration:none;padding:12px 28px;font-family:Helvetica,Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">
            Read Full Analysis at GMIIE Intelligence &rarr;
          </a>
          <div style="margin-top:12px;font-family:Helvetica,Arial,sans-serif;font-size:11px;color:#9ca3af;">
            A PDF copy of this briefing is attached.
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#1a1a1a;padding:16px 36px;text-align:center;">
          <div style="font-family:Helvetica,Arial,sans-serif;font-size:10px;color:rgba(255,255,255,0.45);line-height:1.7;">
            <strong style="color:rgba(255,255,255,0.7);">GMIIE Pulse</strong> &middot; news.unykorn.org<br>
            You subscribed at xxxiii.io. Reply to this email to unsubscribe.
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
