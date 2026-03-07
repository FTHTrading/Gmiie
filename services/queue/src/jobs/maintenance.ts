/**
 * Maintenance Job Handler
 * ========================
 * Periodic maintenance tasks:
 * - Cleanup old jobs and stale data
 * - Compute and log queue/system stats
 * - Health check all services
 * - Log stats to DB
 */

import type { Job } from 'bullmq';
import type { MaintenanceJobData } from '../index';
import { getQueue, QUEUE_NAMES } from '../index';
import { prisma } from '@xxxiii/db';

export async function handleMaintenance(job: Job<MaintenanceJobData>): Promise<any> {
  const { type } = job.data;

  job.updateProgress(10);

  switch (type) {
    case 'cleanup':
      return await runCleanup(job);
    case 'stats':
      return await computeStats(job);
    case 'health_check':
      return await healthCheck(job);
    case 'reindex':
      return await reindex(job);
    default:
      throw new Error(`Unknown maintenance type: ${type}`);
  }
}

async function runCleanup(job: Job<MaintenanceJobData>): Promise<any> {
  const results: Record<string, any> = {};

  // Clean completed/failed jobs older than retention period
  for (const [name, queueName] of Object.entries(QUEUE_NAMES)) {
    try {
      const queue = getQueue(queueName);
      const completedCleaned = await queue.clean(24 * 60 * 60 * 1000, 1000, 'completed');
      const failedCleaned = await queue.clean(7 * 24 * 60 * 60 * 1000, 500, 'failed');
      results[name] = {
        completedRemoved: completedCleaned.length,
        failedRemoved: failedCleaned.length,
      };
    } catch (err) {
      results[name] = { error: String(err) };
    }
  }

  job.updateProgress(40);

  // Clean old job logs (> 30 days)
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const deletedLogs = await prisma.jobLog.deleteMany({
    where: { createdAt: { lt: cutoff } },
  });

  // Clean stale INGESTED articles (> 7 days without processing)
  const staleCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const staleArticles = await prisma.article.updateMany({
    where: {
      status: 'INGESTED',
      createdAt: { lt: staleCutoff },
    },
    data: { status: 'ARCHIVED' },
  });

  job.updateProgress(80);

  await prisma.jobLog.create({
    data: {
      jobType: 'maintenance_cleanup',
      status: 'COMPLETED',
      metadata: {
        queues: results,
        jobLogsDeleted: deletedLogs.count,
        staleArticlesArchived: staleArticles.count,
      },
      completedAt: new Date(),
    },
  });

  job.updateProgress(100);
  return {
    type: 'cleanup',
    queues: results,
    jobLogsDeleted: deletedLogs.count,
    staleArticlesArchived: staleArticles.count,
  };
}

async function computeStats(job: Job<MaintenanceJobData>): Promise<any> {
  const queueStats: Record<string, any> = {};

  for (const [name, queueName] of Object.entries(QUEUE_NAMES)) {
    try {
      const queue = getQueue(queueName);
      const counts = await queue.getJobCounts();
      queueStats[name] = counts;
    } catch (err) {
      queueStats[name] = { error: String(err) };
    }
  }

  // DB stats
  const [articleCount, publishedCount, sourceCount, entityCount] = await Promise.all([
    prisma.article.count(),
    prisma.article.count({ where: { status: 'PUBLISHED' } }),
    prisma.source.count({ where: { isActive: true } }),
    prisma.entity.count({ where: { isActive: true } }),
  ]);

  const dbStats = {
    totalArticles: articleCount,
    publishedArticles: publishedCount,
    activeSources: sourceCount,
    activeEntities: entityCount,
  };

  await prisma.jobLog.create({
    data: {
      jobType: 'maintenance_stats',
      status: 'COMPLETED',
      metadata: { queues: queueStats, db: dbStats },
      completedAt: new Date(),
    },
  });

  job.updateProgress(100);
  return { type: 'stats', queues: queueStats, db: dbStats };
}

async function healthCheck(job: Job<MaintenanceJobData>): Promise<any> {
  const checks: Record<string, boolean> = {};

  // Check Redis
  try {
    const queue = getQueue(QUEUE_NAMES.CLASSIFY);
    await queue.getJobCounts();
    checks.redis = true;
  } catch {
    checks.redis = false;
  }

  job.updateProgress(30);

  // Check PostgreSQL
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.postgres = true;
  } catch {
    checks.postgres = false;
  }

  job.updateProgress(50);

  // Check ingestion service
  try {
    const res = await fetch(
      `${process.env.INGESTION_SERVICE_URL || 'http://localhost:8100'}/health`,
    );
    checks.ingestion = res.ok;
  } catch {
    checks.ingestion = false;
  }

  job.updateProgress(70);

  const allHealthy = Object.values(checks).every(Boolean);

  await prisma.jobLog.create({
    data: {
      jobType: 'health_check',
      status: allHealthy ? 'COMPLETED' : 'FAILED',
      metadata: { checks, healthy: allHealthy },
      completedAt: new Date(),
    },
  });

  job.updateProgress(100);
  return { type: 'health_check', healthy: allHealthy, checks };
}

async function reindex(job: Job<MaintenanceJobData>): Promise<any> {
  // Rebuild article search index stats
  const articles = await prisma.article.count({ where: { status: 'PUBLISHED' } });
  job.updateProgress(100);
  return { type: 'reindex', documentsIndexed: articles };
}
