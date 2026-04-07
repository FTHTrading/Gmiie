/**
 * Extract Entities Job Handler
 * ============================
 * After a new English article is published, this job runs entity extraction
 * against all active known entities in the database. Matched entities are
 * upserted into ArticleEntity with a role classification:
 *
 *   subject    — central focus of the article
 *   mentioned  — referenced but not the main focus
 *   partner    — collaborating entity in a deal/initiative
 *   regulator  — acting in a supervisory/enforcement capacity
 *
 * DB Persistence: Upserts ArticleEntity rows. Non-fatal per-entity errors
 * are silently skipped so a single bad slug never aborts the whole job.
 *
 * Triggered by: publish.ts → EXTRACT_ENTITIES queue (delay 30s)
 */

import type { Job } from 'bullmq';
import type { ExtractEntitiesJobData } from '../index';
import { prisma } from '@xxxiii/db';
import { AIEngine } from '@xxxiii/ai-engine/src/engine';
import { Writer } from '@xxxiii/ai-engine/src/writer';

let writer: Writer | null = null;

function getWriter(): Writer {
  if (!writer) {
    const engine = new AIEngine({
      openaiApiKey: process.env.OPENAI_API_KEY!,
    });
    writer = new Writer(engine);
  }
  return writer;
}

export async function handleExtractEntities(job: Job<ExtractEntitiesJobData>): Promise<void> {
  const { articleId, title, summary, body } = job.data;

  // Fetch all active entities once per job
  const knownEntities = await prisma.entity.findMany({
    where: { isActive: true },
    select: { id: true, slug: true, name: true, shortName: true, entityType: true },
  });

  if (knownEntities.length === 0) return;

  job.updateProgress(20);

  const { entities } = await getWriter().extractEntities({
    title,
    summary,
    body,
    knownEntities,
  });

  if (entities.length === 0) return;

  job.updateProgress(60);

  const slugMap = new Map(knownEntities.map(e => [e.slug, e.id]));
  let matched = 0;

  for (const match of entities) {
    const entityId = slugMap.get(match.slug);
    if (!entityId) continue;
    try {
      await prisma.articleEntity.upsert({
        where: { articleId_entityId: { articleId, entityId } },
        update: { role: match.role },
        create: { articleId, entityId, role: match.role },
      });
      matched++;
    } catch {
      // Non-fatal: skip individual entity upsert failures
    }
  }

  job.updateProgress(100);

  console.log(JSON.stringify({
    level: 'info',
    msg: 'Entity extraction complete',
    articleId,
    candidatesReturned: entities.length,
    matched,
    ts: new Date().toISOString(),
  }));
}
