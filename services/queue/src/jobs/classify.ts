/**
 * Classification Job Handler
 * ==========================
 * Calls AI engine classifier to determine topic, entities,
 * article type, and urgency, then chains to scoring.
 *
 * DB Persistence: Updates Article with classification results,
 * creates ArticleTopic + ArticleEntity + ArticleTag relations.
 */

import type { Job } from 'bullmq';
import type { ClassifyJobData, ScoreJobData } from '../index';
import { getQueue, QUEUE_NAMES } from '../index';
import { AIEngine, Classifier } from '@xxxiii/ai-engine';
import { prisma } from '@xxxiii/db';

let classifier: Classifier | null = null;

function getClassifier(): Classifier {
  if (!classifier) {
    const engine = new AIEngine({
      openaiApiKey: process.env.OPENAI_API_KEY!,
      defaultModel: 'gpt-4o',
      fallbackModel: 'gpt-4o-mini',
    });
    classifier = new Classifier(engine);
  }
  return classifier;
}

export async function handleClassify(job: Job<ClassifyJobData>): Promise<any> {
  const { articleId, title, content, source, credibility } = job.data;

  job.updateProgress(10);

  // Update article status to PROCESSING
  await prisma.article.update({
    where: { id: articleId },
    data: { status: 'PROCESSING' },
  });

  const result = await getClassifier().classify({
    title,
    content: content.slice(0, 8000),
    source,
    credibility: credibility || 'TIER_3',
  });

  const cls = result.classification;
  job.updateProgress(60);

  // Persist classification to article record
  await prisma.article.update({
    where: { id: articleId },
    data: {
      articleType: cls.articleType as any,
      assetClass: cls.assetClass !== 'NOT_APPLICABLE' ? (cls.assetClass as any) : null,
      sentimentScore: cls.sentiment === 'BULLISH' ? 1 : cls.sentiment === 'BEARISH' ? -1 : 0,
      confidenceScore: cls.confidence,
    },
  });

  // Create topic associations
  if (cls.primaryTopic) {
    const topic = await prisma.topic.findFirst({
      where: { slug: cls.primaryTopic.toLowerCase().replace(/\s+/g, '-') },
    });
    if (topic) {
      await prisma.articleTopic.upsert({
        where: { articleId_topicId: { articleId, topicId: topic.id } },
        create: { articleId, topicId: topic.id, relevance: 1.0 },
        update: { relevance: 1.0 },
      });
    }
  }

  // Create entity associations
  for (const ent of cls.entities || []) {
    const entity = await prisma.entity.findFirst({
      where: {
        OR: [
          { name: { equals: ent.name, mode: 'insensitive' as const } },
          { slug: ent.name.toLowerCase().replace(/\s+/g, '-') },
        ],
      },
    });
    if (entity) {
      await prisma.articleEntity.upsert({
        where: { articleId_entityId: { articleId, entityId: entity.id } },
        create: { articleId, entityId: entity.id, role: ent.type || 'mentioned' },
        update: { role: ent.type || 'mentioned' },
      });
    }
  }

  // Create tag associations
  for (const tagName of cls.tags || []) {
    const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const tag = await prisma.tag.upsert({
      where: { slug },
      create: { name: tagName, slug },
      update: {},
    });
    await prisma.articleTag.upsert({
      where: { articleId_tagId: { articleId, tagId: tag.id } },
      create: { articleId, tagId: tag.id },
      update: {},
    });
  }

  job.updateProgress(80);

  // Log the job
  await prisma.jobLog.create({
    data: {
      jobType: 'classify',
      status: 'COMPLETED',
      sourceId: articleId,
      metadata: {
        primaryTopic: cls.primaryTopic,
        articleType: cls.articleType,
        urgency: cls.urgency,
        confidence: cls.confidence,
        entityCount: cls.entities?.length || 0,
        tokensUsed: result.tokensUsed,
        durationMs: result.durationMs,
      },
      startedAt: new Date(Date.now() - result.durationMs),
      completedAt: new Date(),
    },
  });

  // Chain to scoring queue
  const scoreQueue = getQueue(QUEUE_NAMES.SCORE);
  await scoreQueue.add('score', {
    articleId,
    title,
    summary: content.slice(0, 2000),
    source,
    credibility,
    articleType: cls.articleType,
  } satisfies ScoreJobData);

  job.updateProgress(100);

  return {
    articleId,
    primaryTopic: cls.primaryTopic,
    articleType: cls.articleType,
    urgency: cls.urgency,
    confidence: cls.confidence,
    entities: cls.entities?.length || 0,
    tokensUsed: result.tokensUsed,
  };
}
