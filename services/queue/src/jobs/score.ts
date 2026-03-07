/**
 * Score Job Handler
 * =================
 * Runs 9-dimension signal scoring via AI engine,
 * then chains to draft generation based on score thresholds.
 *
 * DB Persistence: Creates Signal record with 9 dimensions,
 * updates Article importanceScore.
 */

import type { Job } from 'bullmq';
import type { ScoreJobData, DraftJobData } from '../index';
import { getQueue, QUEUE_NAMES } from '../index';
import { AIEngine, Scorer } from '@xxxiii/ai-engine';
import { prisma } from '@xxxiii/db';

let scorer: Scorer | null = null;

function getScorer(): Scorer {
  if (!scorer) {
    const engine = new AIEngine({
      openaiApiKey: process.env.OPENAI_API_KEY!,
      defaultModel: 'gpt-4o',
      fallbackModel: 'gpt-4o-mini',
    });
    scorer = new Scorer(engine);
  }
  return scorer;
}

// Minimum overall score to trigger article drafting
const DRAFT_THRESHOLD = parseFloat(process.env.DRAFT_SCORE_THRESHOLD || '5.0');

// Score threshold for deep dive vs brief
const DEEP_DIVE_THRESHOLD = 8.0;
const ANALYSIS_THRESHOLD = 6.5;

export async function handleScore(job: Job<ScoreJobData>): Promise<any> {
  const { articleId, title, summary, source, credibility, articleType } = job.data;

  job.updateProgress(10);

  const result = await getScorer().score({
    title,
    summary,
    source,
    credibility,
    articleType,
  });

  const scoreData = result.score;
  job.updateProgress(50);

  // Persist Signal record to database
  await prisma.signal.create({
    data: {
      articleId,
      // Map 9-dimension scores (AI returns 1-10, DB stores 0-100)
      institutionalAdoption: (scoreData.dimensions.institutionalRelevance || 5) * 10,
      regulatoryClarity: (scoreData.dimensions.regulatorySignificance || 5) * 10,
      marketReadiness: (scoreData.dimensions.marketImpact || 5) * 10,
      infrastructureMaturity: (scoreData.dimensions.technicalImportance || 5) * 10,
      settlementImpact: (scoreData.dimensions.precedentValue || 5) * 10,
      complianceIntensity: (scoreData.dimensions.regulatorySignificance || 5) * 10,
      crossBorderRelevance: (scoreData.dimensions.crossBorderRelevance || 5) * 10,
      liquiditySignificance: (scoreData.dimensions.marketImpact || 5) * 10,
      strategicUrgency: (scoreData.dimensions.timeSensitivity || 5) * 10,
      overallScore: scoreData.overall * 10,
    },
  });

  // Update article importance score
  await prisma.article.update({
    where: { id: articleId },
    data: {
      importanceScore: scoreData.overall,
    },
  });

  job.updateProgress(70);

  // Log the job
  await prisma.jobLog.create({
    data: {
      jobType: 'score',
      status: 'COMPLETED',
      sourceId: articleId,
      metadata: {
        overall: scoreData.overall,
        dimensions: scoreData.dimensions as unknown as Record<string, number>,
        reasoning: scoreData.reasoning,
        tokensUsed: result.tokensUsed,
        durationMs: result.durationMs,
      } as any,
      startedAt: new Date(Date.now() - result.durationMs),
      completedAt: new Date(),
    },
  });

  // Determine if article meets threshold for drafting
  if (scoreData.overall >= DRAFT_THRESHOLD) {
    let targetType: 'BRIEF' | 'ANALYSIS' | 'DEEP_DIVE' = 'BRIEF';
    if (scoreData.overall >= DEEP_DIVE_THRESHOLD) {
      targetType = 'DEEP_DIVE';
    } else if (scoreData.overall >= ANALYSIS_THRESHOLD) {
      targetType = 'ANALYSIS';
    }

    // Load classification from DB for the draft handler
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: {
        articleType: true,
        assetClass: true,
        sentimentScore: true,
        topics: { include: { topic: true } },
        entities: { include: { entity: true } },
      },
    });

    const classification = {
      primaryTopic: article?.topics?.[0]?.topic?.slug || '',
      topicCluster: article?.topics?.[0]?.topic?.slug || 'tokenization',
      assetClass: article?.assetClass || 'NOT_APPLICABLE',
      entities: article?.entities?.map(ae => ({
        name: ae.entity.name,
        type: ae.entity.entityType,
      })) || [],
      articleType: article?.articleType || 'BRIEF',
      urgency: 'NORMAL',
    };

    // Chain to draft queue
    const draftQueue = getQueue(QUEUE_NAMES.DRAFT);
    await draftQueue.add('draft', {
      articleId,
      title,
      content: summary,
      source,
      credibility,
      classification,
      score: {
        overall: scoreData.overall,
        dimensions: scoreData.dimensions,
        reasoning: scoreData.reasoning,
      },
      targetType,
    } satisfies DraftJobData);
  } else {
    // Below threshold — mark as DRAFT (low-priority, won't be published)
    await prisma.article.update({
      where: { id: articleId },
      data: { status: 'DRAFT' },
    });
  }

  job.updateProgress(100);

  return {
    articleId,
    overall: scoreData.overall,
    meetsThreshold: scoreData.overall >= DRAFT_THRESHOLD,
    tokensUsed: result.tokensUsed,
  };
}
