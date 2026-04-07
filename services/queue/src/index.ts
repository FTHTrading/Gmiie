/**
 * XXXIII Queue Architecture
 * =========================
 * BullMQ-powered job queue system orchestrating the full pipeline:
 *
 * QUEUES:
 * 1. ingestion     — RSS polling, web scraping, API fetching
 * 2. classify      — AI content classification
 * 3. score         — AI signal scoring
 * 4. draft         — AI article generation
 * 5. seo           — SEO optimization pass
 * 6. review        — Human review queue
 * 7. publish       — Article publishing
 * 8. entity        — Entity profile refresh
 * 9. newsletter    — Newsletter compilation
 * 10. sitemap      — Sitemap regeneration
 * 11. maintenance  — Cleanup, stats, health checks
 */

import { Queue, Worker, FlowProducer, type JobsOptions } from 'bullmq';
import IORedis from 'ioredis';

// ─── Redis Connection ────────────────────────────────────────────

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisConnection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// ─── Queue Definitions ───────────────────────────────────────────

export const QUEUE_NAMES = {
  INGESTION: 'xxxiii-ingestion',
  CLASSIFY: 'xxxiii-classify',
  SCORE: 'xxxiii-score',
  DRAFT: 'xxxiii-draft',
  SEO: 'xxxiii-seo',
  REVIEW: 'xxxiii-review',
  PUBLISH: 'xxxiii-publish',
  TRANSLATE: 'xxxiii-translate',
  ENTITY: 'xxxiii-entity',
  NEWSLETTER: 'xxxiii-newsletter',
  SITEMAP: 'xxxiii-sitemap',
  MAINTENANCE: 'xxxiii-maintenance',
} as const;

export type QueueName = typeof QUEUE_NAMES[keyof typeof QUEUE_NAMES];

// ─── Default Job Options ─────────────────────────────────────────

const DEFAULT_JOB_OPTIONS: JobsOptions = {
  attempts: 3,
  backoff: {
    type: 'exponential',
    delay: 5000,
  },
  removeOnComplete: {
    count: 1000,
    age: 24 * 60 * 60, // 24 hours
  },
  removeOnFail: {
    count: 500,
    age: 7 * 24 * 60 * 60, // 7 days
  },
};

// ─── Queue Factory ───────────────────────────────────────────────

const queues = new Map<string, Queue>();

export function getQueue(name: QueueName): Queue {
  if (!queues.has(name)) {
    const queue = new Queue(name, {
      connection: redisConnection as any,
      defaultJobOptions: DEFAULT_JOB_OPTIONS,
    });
    queues.set(name, queue);
  }
  return queues.get(name)!;
}

// ─── Job Types ───────────────────────────────────────────────────

export interface IngestionJobData {
  type: 'rss_poll' | 'web_scrape' | 'api_fetch' | 'sitemap_crawl';
  sourceId?: string;
  url?: string;
  batchId?: string;
}

export interface ClassifyJobData {
  articleId: string;
  title: string;
  content: string;
  source: string;
  credibility: string;
}

export interface ScoreJobData {
  articleId: string;
  title: string;
  summary: string;
  source: string;
  credibility: string;
  articleType: string;
}

export interface DraftJobData {
  articleId: string;
  title: string;
  content: string;
  source: string;
  credibility: string;
  classification: any;
  score: any;
  targetType: 'BRIEF' | 'ANALYSIS' | 'DEEP_DIVE';
}

export interface SEOJobData {
  articleId: string;
  title: string;
  primaryTopic: string;
  entities: string;
  summary: string;
  keyPoints: string;
}

export interface PublishJobData {
  articleId: string;
  autoPublish: boolean;
}

export interface TranslateJobData {
  /** Source article that was just published (English) */
  articleId: string;
  title: string;
  subtitle: string;
  summary: string;
  body: string;
  keyPoints: string[];
  gmiieSignal: string;
  slug: string;
  /** ISO 639-1 target codes — defaults to all supported if omitted */
  targetLanguages?: string[];
}

export interface EntityJobData {
  entityId: string;
  entityName: string;
  action: 'build_profile' | 'refresh' | 'merge';
}

export interface NewsletterJobData {
  type: 'daily' | 'weekly';
  edition?: 'am' | 'pm';
  dateRange?: { from: string; to: string };
}

export interface SitemapJobData {
  type: 'full' | 'news' | 'topics' | 'entities';
}

export interface MaintenanceJobData {
  type: 'cleanup' | 'stats' | 'health_check' | 'reindex';
}

// ─── Flow Producer ───────────────────────────────────────────────
// Orchestrates multi-step job flows (ingestion → classify → score → draft → seo → publish)

export const flowProducer = new FlowProducer({ connection: redisConnection as any });

/**
 * Create the standard article processing flow.
 * This chains: classify → score → draft → seo → review/publish
 */
export async function createArticleFlow(params: {
  articleId: string;
  title: string;
  content: string;
  source: string;
  credibility: string;
}): Promise<string> {
  const flow = await flowProducer.add({
    name: 'article-pipeline',
    queueName: QUEUE_NAMES.CLASSIFY,
    data: {
      articleId: params.articleId,
      title: params.title,
      content: params.content,
      source: params.source,
      credibility: params.credibility,
    } satisfies ClassifyJobData,
    children: [
      {
        name: 'score-article',
        queueName: QUEUE_NAMES.SCORE,
        data: {
          articleId: params.articleId,
          title: params.title,
          summary: '', // Will be populated by classify step
          source: params.source,
          credibility: params.credibility,
          articleType: '', // Will be populated by classify step
        } satisfies ScoreJobData,
      },
    ],
  });

  return flow.job.id || '';
}

// ─── Scheduled Jobs ──────────────────────────────────────────────

export async function setupScheduledJobs(): Promise<void> {
  const ingestionQueue = getQueue(QUEUE_NAMES.INGESTION);
  const newsletterQueue = getQueue(QUEUE_NAMES.NEWSLETTER);
  const sitemapQueue = getQueue(QUEUE_NAMES.SITEMAP);
  const maintenanceQueue = getQueue(QUEUE_NAMES.MAINTENANCE);
  const entityQueue = getQueue(QUEUE_NAMES.ENTITY);

  // RSS polling — every 15 minutes
  await ingestionQueue.upsertJobScheduler(
    'rss-poll-schedule',
    { every: 15 * 60 * 1000 },
    {
      name: 'rss-poll',
      data: { type: 'rss_poll' } satisfies IngestionJobData,
    },
  );

  // Web scraping — every hour
  await ingestionQueue.upsertJobScheduler(
    'scrape-schedule',
    { every: 60 * 60 * 1000 },
    {
      name: 'web-scrape',
      data: { type: 'web_scrape' } satisfies IngestionJobData,
    },
  );

  // API fetching — every 30 minutes
  await ingestionQueue.upsertJobScheduler(
    'api-fetch-schedule',
    { every: 30 * 60 * 1000 },
    {
      name: 'api-fetch',
      data: { type: 'api_fetch' } satisfies IngestionJobData,
    },
  );

  const digestCadence = (process.env.NEWSLETTER_DIGEST_CADENCE || 'twice_daily').toLowerCase();
  const windows = (process.env.NEWSLETTER_DAILY_WINDOWS_UTC || '6,18')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => Number.parseInt(v, 10))
    .filter((v) => Number.isFinite(v) && v >= 0 && v <= 23);

  const [amHour, pmHour] = windows.length >= 2
    ? [windows[0], windows[1]]
    : [6, 18];

  if (digestCadence === 'daily') {
    await newsletterQueue.upsertJobScheduler(
      'daily-newsletter',
      { pattern: `0 ${amHour} * * *` },
      {
        name: 'daily-digest',
        data: { type: 'daily', edition: 'am' } satisfies NewsletterJobData,
      },
    );
  } else {
    // Twice-daily digest windows (AM / PM UTC)
    await newsletterQueue.upsertJobScheduler(
      'daily-newsletter-am',
      { pattern: `0 ${amHour} * * *` },
      {
        name: 'daily-digest-am',
        data: { type: 'daily', edition: 'am' } satisfies NewsletterJobData,
      },
    );

    await newsletterQueue.upsertJobScheduler(
      'daily-newsletter-pm',
      { pattern: `0 ${pmHour} * * *` },
      {
        name: 'daily-digest-pm',
        data: { type: 'daily', edition: 'pm' } satisfies NewsletterJobData,
      },
    );
  }

  // Weekly newsletter — Monday 7:00 AM UTC
  await newsletterQueue.upsertJobScheduler(
    'weekly-newsletter',
    { pattern: '0 7 * * 1' },
    {
      name: 'weekly-roundup',
      data: { type: 'weekly' } satisfies NewsletterJobData,
    },
  );

  // Sitemap regeneration — every 6 hours
  await sitemapQueue.upsertJobScheduler(
    'sitemap-regen',
    { every: 6 * 60 * 60 * 1000 },
    {
      name: 'sitemap-regen',
      data: { type: 'full' } satisfies SitemapJobData,
    },
  );

  // Maintenance — daily at 2:00 AM UTC
  await maintenanceQueue.upsertJobScheduler(
    'daily-maintenance',
    { pattern: '0 2 * * *' },
    {
      name: 'daily-cleanup',
      data: { type: 'cleanup' } satisfies MaintenanceJobData,
    },
  );

  // Entity refresh — every 12 hours
  await entityQueue.upsertJobScheduler(
    'entity-refresh',
    { every: 12 * 60 * 60 * 1000 },
    {
      name: 'entity-refresh',
      data: { entityId: '', entityName: '', action: 'refresh' } satisfies EntityJobData,
    },
  );

  console.log('[Queue] Scheduled jobs configured');
}

// ─── Exports ─────────────────────────────────────────────────────

export { Queue, Worker } from 'bullmq';
