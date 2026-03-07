/**
 * Draft Job Handler
 * =================
 * Generates article drafts via AI engine writer,
 * then chains to SEO optimization.
 *
 * DB Persistence: Updates Article with AI-generated content
 * (title, body, summary, key points, implications).
 */

import type { Job } from 'bullmq';
import type { DraftJobData, SEOJobData } from '../index';
import { getQueue, QUEUE_NAMES } from '../index';
import { AIEngine, Writer } from '@xxxiii/ai-engine';
import { prisma } from '@xxxiii/db';

let writer: Writer | null = null;

function getWriter(): Writer {
  if (!writer) {
    const engine = new AIEngine({
      openaiApiKey: process.env.OPENAI_API_KEY!,
      defaultModel: 'gpt-4o',
      fallbackModel: 'gpt-4o-mini',
    });
    writer = new Writer(engine);
  }
  return writer;
}

export async function handleDraft(job: Job<DraftJobData>): Promise<any> {
  const { articleId, title, content, source, credibility, classification, score, targetType } =
    job.data;

  job.updateProgress(10);

  // Build classification object that Writer expects
  const classificationInput = {
    primaryTopic: classification?.primaryTopic || 'tokenized-securities',
    secondaryTopics: [],
    topicCluster: classification?.topicCluster || 'tokenization',
    assetClass: classification?.assetClass || 'NOT_APPLICABLE',
    entities: classification?.entities || [],
    articleType: classification?.articleType || targetType || 'BRIEF',
    sentiment: 'NEUTRAL' as const,
    urgency: classification?.urgency || 'NORMAL',
    confidence: 0.8,
    tags: [],
  };

  // Build score object if available
  const scoreInput = score
    ? {
        overall: score.overall || 5,
        dimensions: score.dimensions || {},
        reasoning: score.reasoning || '',
      }
    : { overall: 5, dimensions: {}, reasoning: '' };

  let result: any;

  switch (targetType) {
    case 'DEEP_DIVE':
      result = await getWriter().writeDeepDive({
        theme: title,
        classification: classificationInput,
        score: scoreInput,
        sources: content,
      });
      break;

    case 'ANALYSIS':
      result = await getWriter().writeAnalysis({
        title,
        content,
        source,
        credibility,
        classification: classificationInput,
        score: scoreInput,
      });
      break;

    case 'BRIEF':
    default:
      result = await getWriter().writeBrief({
        title,
        content,
        source,
        credibility,
        classification: classificationInput,
      });
      break;
  }

  const draft = result.draft;
  job.updateProgress(60);

  // Persist draft to database
  await prisma.article.update({
    where: { id: articleId },
    data: {
      status: 'DRAFT',
      headline: draft.title || title,
      dek: draft.subtitle || null,
      content: draft.body || content,
      executiveSummary: draft.summary || null,
      whyItMatters: draft.implications?.join('\n\n') || null,
      whatHappened: draft.keyPoints?.join('\n\n') || null,
      articleType: targetType === 'DEEP_DIVE' ? 'DEEP_DIVE' : targetType === 'ANALYSIS' ? 'INFRA_ANALYSIS' : 'BRIEF',
    },
  });

  job.updateProgress(80);

  // Log the job
  await prisma.jobLog.create({
    data: {
      jobType: 'draft',
      status: 'COMPLETED',
      sourceId: articleId,
      metadata: {
        targetType,
        draftTitle: draft.title || title,
        wordCount: draft.body?.split(/\s+/).length || 0,
        tokensUsed: result.tokensUsed,
        durationMs: result.durationMs,
      },
      startedAt: new Date(Date.now() - result.durationMs),
      completedAt: new Date(),
    },
  });

  // Chain to SEO optimization
  const seoQueue = getQueue(QUEUE_NAMES.SEO);
  await seoQueue.add('seo', {
    articleId,
    title: draft.title || title,
    primaryTopic: classification?.primaryTopic || '',
    entities: JSON.stringify(classification?.entities || []),
    summary: draft.summary || '',
    keyPoints: JSON.stringify(draft.keyPoints || []),
  } satisfies SEOJobData);

  job.updateProgress(100);

  return {
    articleId,
    draftType: targetType,
    title: draft.title || title,
    slug: draft.slug,
    wordCount: draft.body?.split(/\s+/).length || 0,
    tokensUsed: result.tokensUsed,
  };
}
