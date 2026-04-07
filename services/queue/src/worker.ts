/**
 * XXXIII Queue Worker
 * ===================
 * Main BullMQ worker entry point — registers all job processors
 * and manages the worker lifecycle.
 *
 * Exposes health check on port 8200.
 *
 * Usage:
 *   npx tsx src/worker.ts
 */

import 'dotenv/config';
import { Worker, type Job } from 'bullmq';
import { createServer, type IncomingMessage, type ServerResponse } from 'http';
import { redisConnection, QUEUE_NAMES, getQueue, setupScheduledJobs } from './index';
import { handleClassify } from './jobs/classify';
import { handleScore } from './jobs/score';
import { handleDraft } from './jobs/draft';
import { handleSEO } from './jobs/seo';
import { handlePublish } from './jobs/publish';
import { handleEntity } from './jobs/entity-refresh';
import { handleNewsletter } from './jobs/newsletter';
import { handleSitemap } from './jobs/sitemap-regen';
import { handleIngestion } from './jobs/ingestion';
import { handleMaintenance } from './jobs/maintenance';
import { handleTranslate } from './jobs/translate';

import type {
  ClassifyJobData,
  ScoreJobData,
  DraftJobData,
  SEOJobData,
  PublishJobData,
  TranslateJobData,
  EntityJobData,
  NewsletterJobData,
  SitemapJobData,
  IngestionJobData,
  MaintenanceJobData,
} from './index';

// ─── Logger ──────────────────────────────────────────────────────

const log = {
  info: (msg: string, data?: any) =>
    console.log(JSON.stringify({ level: 'info', msg, ...data, ts: new Date().toISOString() })),
  error: (msg: string, data?: any) =>
    console.error(JSON.stringify({ level: 'error', msg, ...data, ts: new Date().toISOString() })),
  warn: (msg: string, data?: any) =>
    console.warn(JSON.stringify({ level: 'warn', msg, ...data, ts: new Date().toISOString() })),
};

// ─── Worker Factory ──────────────────────────────────────────────

function createWorker<T>(
  queueName: string,
  processor: (job: Job<T>) => Promise<any>,
  concurrency = 5,
): Worker<T> {
  const worker = new Worker<T>(queueName, processor, {
    connection: redisConnection as any,
    concurrency,
    limiter: {
      max: concurrency * 2,
      duration: 1000,
    },
  });

  worker.on('completed', (job) => {
    log.info(`Job completed`, { queue: queueName, jobId: job.id, name: job.name });
  });

  worker.on('failed', (job, err) => {
    log.error(`Job failed`, {
      queue: queueName,
      jobId: job?.id,
      name: job?.name,
      error: err.message,
      attempt: job?.attemptsMade,
    });
  });

  worker.on('stalled', (jobId) => {
    log.warn(`Job stalled`, { queue: queueName, jobId });
  });

  worker.on('error', (err) => {
    log.error(`Worker error`, { queue: queueName, error: err.message });
  });

  return worker;
}

// ─── Worker Registration ─────────────────────────────────────────

const workers: Worker[] = [];

async function startWorkers(): Promise<void> {
  log.info('Starting XXXIII queue workers...');

  // Ingestion worker (low concurrency — rate limiting)
  workers.push(
    createWorker<IngestionJobData>(
      QUEUE_NAMES.INGESTION,
      handleIngestion,
      2,
    ),
  );

  // Classification worker
  workers.push(
    createWorker<ClassifyJobData>(
      QUEUE_NAMES.CLASSIFY,
      handleClassify,
      5,
    ),
  );

  // Scoring worker
  workers.push(
    createWorker<ScoreJobData>(
      QUEUE_NAMES.SCORE,
      handleScore,
      5,
    ),
  );

  // Draft writer worker (lower concurrency — high token usage)
  workers.push(
    createWorker<DraftJobData>(
      QUEUE_NAMES.DRAFT,
      handleDraft,
      3,
    ),
  );

  // SEO optimization worker
  workers.push(
    createWorker<SEOJobData>(
      QUEUE_NAMES.SEO,
      handleSEO,
      5,
    ),
  );

  // Publishing worker (sequential — avoid conflicts)
  workers.push(
    createWorker<PublishJobData>(
      QUEUE_NAMES.PUBLISH,
      handlePublish,
      1,
    ),
  );

  // Entity profile worker
  workers.push(
    createWorker<EntityJobData>(
      QUEUE_NAMES.ENTITY,
      handleEntity,
      3,
    ),
  );

  // Newsletter compilation worker (low concurrency)
  workers.push(
    createWorker<NewsletterJobData>(
      QUEUE_NAMES.NEWSLETTER,
      handleNewsletter,
      1,
    ),
  );

  // Sitemap regeneration worker
  workers.push(
    createWorker<SitemapJobData>(
      QUEUE_NAMES.SITEMAP,
      handleSitemap,
      1,
    ),
  );

  // Translation worker (low concurrency — GPT-4o costs; fans out per language)
  workers.push(
    createWorker<TranslateJobData>(
      QUEUE_NAMES.TRANSLATE,
      handleTranslate,
      2,
    ),
  );

  // Maintenance worker
  workers.push(
    createWorker<MaintenanceJobData>(
      QUEUE_NAMES.MAINTENANCE,
      handleMaintenance,
      1,
    ),
  );

  // Set up scheduled jobs
  await setupScheduledJobs();

  log.info(`${workers.length} workers started across ${Object.keys(QUEUE_NAMES).length} queues`);

  // Start health check HTTP server on port 8200
  startHealthServer();
}

// ─── Health Check Server ──────────────────────────────────────────

const HEALTH_PORT = parseInt(process.env.QUEUE_HEALTH_PORT || '8200');
let healthServer: ReturnType<typeof createServer>;

function startHealthServer(): void {
  healthServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    if (req.url === '/health' && req.method === 'GET') {
      try {
        // Check Redis connectivity
        const queue = getQueue(QUEUE_NAMES.CLASSIFY);
        const counts = await queue.getJobCounts();

        const status = {
          status: 'ok',
          workers: workers.length,
          uptime: process.uptime(),
          queues: {} as Record<string, any>,
        };

        for (const [name, queueName] of Object.entries(QUEUE_NAMES)) {
          try {
            const q = getQueue(queueName);
            status.queues[name] = await q.getJobCounts();
          } catch {
            status.queues[name] = { error: 'unreachable' };
          }
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(status));
      } catch (err: any) {
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', error: err.message }));
      }
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  });

  healthServer.listen(HEALTH_PORT, () => {
    log.info(`Health check server listening on :${HEALTH_PORT}/health`);
  });
}

// ─── Graceful Shutdown ───────────────────────────────────────────

async function shutdown(signal: string): Promise<void> {
  log.info(`Received ${signal}, shutting down workers...`);

  if (healthServer) {
    healthServer.close();
  }

  await Promise.allSettled(
    workers.map(async (worker) => {
      await worker.close();
    }),
  );

  await redisConnection.quit();
  log.info('All workers shut down cleanly');
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ─── Main ────────────────────────────────────────────────────────

startWorkers().catch((err) => {
  log.error('Failed to start workers', { error: err.message });
  process.exit(1);
});
