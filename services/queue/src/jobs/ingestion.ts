/**
 * Ingestion Job Handler
 * =====================
 * Dispatches to the Python ingestion service via HTTP
 * or triggers pipeline stages directly.
 */

import type { Job } from 'bullmq';
import type { IngestionJobData } from '../index';
import { getQueue, QUEUE_NAMES } from '../index';

const INGESTION_SERVICE_URL =
  process.env.INGESTION_SERVICE_URL || 'http://localhost:8100';

export async function handleIngestion(job: Job<IngestionJobData>): Promise<any> {
  const { type, sourceId, url, batchId } = job.data;

  job.updateProgress(10);

  switch (type) {
    case 'rss_poll':
      return await triggerRSSPoll(job, sourceId);
    case 'web_scrape':
      return await triggerWebScrape(job, sourceId, url);
    case 'api_fetch':
      return await triggerAPIFetch(job, sourceId);
    case 'sitemap_crawl':
      return await triggerSitemapCrawl(job, url);
    default:
      throw new Error(`Unknown ingestion type: ${type}`);
  }
}

async function triggerRSSPoll(
  job: Job<IngestionJobData>,
  sourceId?: string,
): Promise<{ itemsIngested: number }> {
  const endpoint = sourceId
    ? `${INGESTION_SERVICE_URL}/api/poll/${sourceId}`
    : `${INGESTION_SERVICE_URL}/api/poll`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`RSS poll failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  job.updateProgress(50);

  // Dispatch classify jobs for each new item
  const classifyQueue = getQueue(QUEUE_NAMES.CLASSIFY);
  for (const item of result.items || []) {
    await classifyQueue.add('classify', {
      articleId: item.id,
      title: item.title,
      content: item.content,
      source: item.source,
      credibility: item.credibility,
    });
  }

  job.updateProgress(100);
  return { itemsIngested: result.items?.length || 0 };
}

async function triggerWebScrape(
  job: Job<IngestionJobData>,
  sourceId?: string,
  url?: string,
): Promise<{ pagesScraped: number }> {
  const body: any = {};
  if (sourceId) body.sourceId = sourceId;
  if (url) body.url = url;

  const response = await fetch(`${INGESTION_SERVICE_URL}/api/scrape`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Scrape failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  job.updateProgress(50);

  // Dispatch classify jobs
  const classifyQueue = getQueue(QUEUE_NAMES.CLASSIFY);
  for (const item of result.items || []) {
    await classifyQueue.add('classify', {
      articleId: item.id,
      title: item.title,
      content: item.content,
      source: item.source,
      credibility: item.credibility,
    });
  }

  job.updateProgress(100);
  return { pagesScraped: result.items?.length || 0 };
}

async function triggerAPIFetch(
  job: Job<IngestionJobData>,
  sourceId?: string,
): Promise<{ itemsFetched: number }> {
  const endpoint = sourceId
    ? `${INGESTION_SERVICE_URL}/api/fetch/${sourceId}`
    : `${INGESTION_SERVICE_URL}/api/fetch`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`API fetch failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  job.updateProgress(50);

  const classifyQueue = getQueue(QUEUE_NAMES.CLASSIFY);
  for (const item of result.items || []) {
    await classifyQueue.add('classify', {
      articleId: item.id,
      title: item.title,
      content: item.content,
      source: item.source,
      credibility: item.credibility,
    });
  }

  job.updateProgress(100);
  return { itemsFetched: result.items?.length || 0 };
}

async function triggerSitemapCrawl(
  job: Job<IngestionJobData>,
  url?: string,
): Promise<{ urlsDiscovered: number }> {
  if (!url) throw new Error('Sitemap URL required for crawl');

  const response = await fetch(`${INGESTION_SERVICE_URL}/api/sitemap`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error(`Sitemap crawl failed: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  job.updateProgress(100);
  return { urlsDiscovered: result.urls?.length || 0 };
}
