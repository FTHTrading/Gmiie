/**
 * Sitemap Regeneration Job Handler
 * =================================
 * Regenerates XML sitemaps for SEO:
 * - Main sitemap index
 * - News sitemap (Google News)
 * - Topics sitemap
 * - Entities sitemap
 *
 * DB Persistence: Queries published articles, topics, entities.
 * Writes sitemap XML to apps/gmiie/public/.
 */

import type { Job } from 'bullmq';
import type { SitemapJobData } from '../index';
import { prisma } from '@xxxiii/db';
import * as fs from 'fs';
import * as path from 'path';

const SITE_URL = process.env.SITE_URL || 'https://gmiie.xxxiii.io';
const PUBLIC_DIR = path.resolve(__dirname, '../../../../apps/gmiie/public');

export async function handleSitemap(job: Job<SitemapJobData>): Promise<any> {
  const { type } = job.data;

  job.updateProgress(10);

  switch (type) {
    case 'full':
      return await regenerateAllSitemaps(job);
    case 'news':
      return await regenerateNewsSitemap(job);
    case 'topics':
      return await regenerateTopicsSitemap(job);
    case 'entities':
      return await regenerateEntitiesSitemap(job);
    default:
      throw new Error(`Unknown sitemap type: ${type}`);
  }
}

function buildSitemapXml(urls: Array<{ loc: string; lastmod?: string; changefreq?: string; priority?: number }>): string {
  const entries = urls.map(u =>
    `  <url>\n    <loc>${u.loc}</loc>${u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : ''}${u.changefreq ? `\n    <changefreq>${u.changefreq}</changefreq>` : ''}${u.priority !== undefined ? `\n    <priority>${u.priority}</priority>` : ''}\n  </url>`
  ).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>`;
}

function writeSitemap(filename: string, xml: string): void {
  try {
    if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    fs.writeFileSync(path.join(PUBLIC_DIR, filename), xml, 'utf-8');
  } catch (err) {
    console.error(`Failed to write sitemap ${filename}:`, err);
  }
}

async function regenerateAllSitemaps(job: Job<SitemapJobData>): Promise<any> {
  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED' },
    select: { slug: true, updatedAt: true, publishedAt: true },
    orderBy: { publishedAt: 'desc' },
  });

  const topics = await prisma.topic.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });

  const entities = await prisma.entity.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });

  job.updateProgress(40);

  // Main sitemap
  const mainXml = buildSitemapXml(articles.map(a => ({
    loc: `${SITE_URL}/intelligence/${a.slug}`,
    lastmod: a.updatedAt.toISOString().split('T')[0],
    changefreq: 'daily',
    priority: 0.8,
  })));
  writeSitemap('sitemap.xml', mainXml);

  // Topics sitemap
  const topicsXml = buildSitemapXml(topics.map(t => ({
    loc: `${SITE_URL}/topics/${t.slug}`,
    lastmod: t.updatedAt.toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: 0.7,
  })));
  writeSitemap('sitemap-topics.xml', topicsXml);

  // Entities sitemap
  const entitiesXml = buildSitemapXml(entities.map(e => ({
    loc: `${SITE_URL}/entities/${e.slug}`,
    lastmod: e.updatedAt.toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: 0.6,
  })));
  writeSitemap('sitemap-entities.xml', entitiesXml);

  job.updateProgress(90);

  await prisma.jobLog.create({
    data: {
      jobType: 'sitemap_full',
      status: 'COMPLETED',
      metadata: {
        articles: articles.length,
        topics: topics.length,
        entities: entities.length,
      },
      completedAt: new Date(),
    },
  });

  job.updateProgress(100);
  return {
    type: 'full',
    articles: articles.length,
    topics: topics.length,
    entities: entities.length,
  };
}

async function regenerateNewsSitemap(job: Job<SitemapJobData>): Promise<any> {
  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000);
  const articles = await prisma.article.findMany({
    where: { status: 'PUBLISHED', publishedAt: { gte: cutoff } },
    select: { slug: true, headline: true, title: true, publishedAt: true },
    orderBy: { publishedAt: 'desc' },
  });

  const newsXml = buildSitemapXml(articles.map(a => ({
    loc: `${SITE_URL}/intelligence/${a.slug}`,
    lastmod: a.publishedAt?.toISOString().split('T')[0],
    priority: 0.9,
  })));
  writeSitemap('sitemap-news.xml', newsXml);

  job.updateProgress(100);
  return { type: 'news', urls: articles.length };
}

async function regenerateTopicsSitemap(job: Job<SitemapJobData>): Promise<any> {
  const topics = await prisma.topic.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });

  const xml = buildSitemapXml(topics.map(t => ({
    loc: `${SITE_URL}/topics/${t.slug}`,
    lastmod: t.updatedAt.toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: 0.7,
  })));
  writeSitemap('sitemap-topics.xml', xml);

  job.updateProgress(100);
  return { type: 'topics', urls: topics.length };
}

async function regenerateEntitiesSitemap(job: Job<SitemapJobData>): Promise<any> {
  const entities = await prisma.entity.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });

  const xml = buildSitemapXml(entities.map(e => ({
    loc: `${SITE_URL}/entities/${e.slug}`,
    lastmod: e.updatedAt.toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: 0.6,
  })));
  writeSitemap('sitemap-entities.xml', xml);

  job.updateProgress(100);
  return { type: 'entities', urls: entities.length };
}
