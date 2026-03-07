/**
 * SEO Optimization Job Handler
 * =============================
 * Runs SEO optimization pass on article drafts:
 * title optimization, meta description, FAQ schema generation.
 * Then chains to review/publish.
 *
 * DB Persistence: Updates Article metaTitle, metaDescription.
 */

import type { Job } from 'bullmq';
import type { SEOJobData, PublishJobData } from '../index';
import { getQueue, QUEUE_NAMES } from '../index';
import { AIEngine, SEOOptimizer } from '@xxxiii/ai-engine';
import { prisma } from '@xxxiii/db';

let optimizer: SEOOptimizer | null = null;

function getOptimizer(): SEOOptimizer {
  if (!optimizer) {
    const engine = new AIEngine({
      openaiApiKey: process.env.OPENAI_API_KEY!,
      defaultModel: 'gpt-4o-mini',
      fallbackModel: 'gpt-4o-mini',
    });
    optimizer = new SEOOptimizer(engine);
  }
  return optimizer;
}

const AUTO_PUBLISH = process.env.AUTO_PUBLISH === 'true';

export async function handleSEO(job: Job<SEOJobData>): Promise<any> {
  const { articleId, title, primaryTopic, entities, summary, keyPoints } = job.data;

  job.updateProgress(10);

  // Generate SEO-optimized title
  const seoTitleResult = await getOptimizer().generateTitle({
    title,
    primaryTopic,
    entities,
    summary,
  });

  job.updateProgress(30);

  // Generate meta description
  const metaDescResult = await getOptimizer().generateMetaDescription({
    title: seoTitleResult.seoTitle,
    summary,
    primaryTopic,
    targetKeyword: primaryTopic,
  });

  job.updateProgress(50);

  // Generate FAQ structured data for Google rich results
  const faqResult = await getOptimizer().generateFAQs({
    title: seoTitleResult.seoTitle,
    summary,
    keyPoints,
    primaryTopic,
  });

  job.updateProgress(70);

  // Persist SEO data to article
  await prisma.article.update({
    where: { id: articleId },
    data: {
      metaTitle: seoTitleResult.seoTitle,
      metaDescription: typeof metaDescResult === 'string' ? metaDescResult : metaDescResult.metaDescription || '',
      headline: seoTitleResult.seoTitle,
    },
  });

  // Log the job
  await prisma.jobLog.create({
    data: {
      jobType: 'seo',
      status: 'COMPLETED',
      sourceId: articleId,
      metadata: {
        seoTitle: seoTitleResult.seoTitle,
        targetKeyword: seoTitleResult.targetKeyword,
        faqCount: Array.isArray(faqResult) ? faqResult.length : 0,
      },
      completedAt: new Date(),
    },
  });

  job.updateProgress(85);

  // Chain to publish queue
  const publishQueue = getQueue(QUEUE_NAMES.PUBLISH);
  await publishQueue.add('publish', {
    articleId,
    autoPublish: AUTO_PUBLISH,
  } satisfies PublishJobData);

  job.updateProgress(100);

  return {
    articleId,
    seoTitle: seoTitleResult.seoTitle,
    targetKeyword: seoTitleResult.targetKeyword,
    optimizedAt: new Date().toISOString(),
  };
}
