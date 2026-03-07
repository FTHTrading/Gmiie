/**
 * Entity Refresh Job Handler
 * ==========================
 * Rebuilds or refreshes entity profiles using recent coverage.
 *
 * DB Persistence: Fetches recent articles from DB, generates profile,
 * persists description/strategic role to Entity record.
 */

import type { Job } from 'bullmq';
import type { EntityJobData } from '../index';
import { AIEngine, EntityProfiler } from '@xxxiii/ai-engine';
import { prisma } from '@xxxiii/db';

let profiler: EntityProfiler | null = null;

function getProfiler(): EntityProfiler {
  if (!profiler) {
    const engine = new AIEngine({
      openaiApiKey: process.env.OPENAI_API_KEY!,
      defaultModel: 'gpt-4o',
      fallbackModel: 'gpt-4o-mini',
    });
    profiler = new EntityProfiler(engine);
  }
  return profiler;
}

export async function handleEntity(job: Job<EntityJobData>): Promise<any> {
  const { entityId, entityName, action } = job.data;

  job.updateProgress(10);

  switch (action) {
    case 'build_profile':
      return await buildProfile(job, entityId, entityName);
    case 'refresh':
      return await refreshAllEntities(job);
    case 'merge':
      return await mergeEntities(job, entityId);
    default:
      throw new Error(`Unknown entity action: ${action}`);
  }
}

async function buildProfile(
  job: Job<EntityJobData>,
  entityId: string,
  entityName: string,
): Promise<any> {
  // Fetch recent articles mentioning this entity from DB
  const entityArticles = await prisma.articleEntity.findMany({
    where: { entityId },
    include: {
      article: {
        select: {
          title: true,
          executiveSummary: true,
          publishedAt: true,
          importanceScore: true,
        },
      },
    },
    orderBy: { article: { publishedAt: 'desc' } },
    take: 20,
  });

  job.updateProgress(30);

  const recentCoverage = entityArticles
    .filter(ea => ea.article.publishedAt)
    .map(ea => ({
      title: ea.article.title,
      summary: ea.article.executiveSummary || '',
      date: ea.article.publishedAt!.toISOString(),
    }));

  const result = await getProfiler().buildProfile({
    entityName,
    recentArticles: recentCoverage,
  });

  job.updateProgress(70);

  // Persist profile to database
  await prisma.entity.update({
    where: { id: entityId },
    data: {
      description: result.profile.description || undefined,
      longDescription: result.profile.relevance || undefined,
      strategicRole: result.profile.type || undefined,
      whyItMatters: result.profile.keyFacts?.join('; ') || undefined,
    },
  });

  await prisma.jobLog.create({
    data: {
      jobType: 'entity_profile',
      status: 'COMPLETED',
      sourceId: entityId,
      metadata: {
        entityName,
        articlesUsed: recentCoverage.length,
        tokensUsed: result.tokensUsed,
      },
      completedAt: new Date(),
    },
  });

  job.updateProgress(100);
  return {
    entityId,
    entityName,
    articlesUsed: recentCoverage.length,
    tokensUsed: result.tokensUsed,
    action: 'build_profile',
  };
}

async function refreshAllEntities(
  job: Job<EntityJobData>,
): Promise<any> {
  // Refresh all active entities that haven't been profiled recently
  const entities = await prisma.entity.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    take: 50,
  });

  let refreshed = 0;
  for (const entity of entities) {
    try {
      await buildProfile(job, entity.id, entity.name);
      refreshed++;
    } catch (err) {
      console.error(`Failed to refresh entity: ${entity.name}`, err);
    }
  }

  job.updateProgress(100);
  return {
    action: 'refresh',
    totalEntities: entities.length,
    refreshed,
  };
}

async function mergeEntities(
  job: Job<EntityJobData>,
  entityId: string,
): Promise<any> {
  // TODO: Implement entity dedup/merge logic
  job.updateProgress(100);
  return {
    entityId,
    action: 'merge',
    mergedCount: 0,
    completedAt: new Date().toISOString(),
  };
}
