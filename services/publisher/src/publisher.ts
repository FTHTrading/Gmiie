/**
 * Publisher — Main Publishing Engine
 * ====================================
 * Orchestrates the full publication workflow:
 * 1. Validate article completeness
 * 2. Sanitize content
 * 3. Generate/verify slug uniqueness
 * 4. Check scheduling & embargoes
 * 5. Transition status
 * 6. Persist & emit events
 */

import { Validator, type ValidationResult } from './validator';
import { SlugGenerator } from './slug';
import { StatusMachine, type ArticleStatus } from './status';
import { ContentSanitizer } from './sanitizer';
import { ScheduleManager } from './scheduler';
import { prisma } from '@xxxiii/db';

export interface PublishRequest {
  articleId: string;
  title: string;
  seoTitle?: string;
  body: string;
  summary?: string;
  slug?: string;
  metaDescription?: string;
  primaryTopic?: string;
  secondaryTopics?: string[];
  entities?: any[];
  credibilityTier?: string;
  source?: string;
  overallScore?: number;
  signalScores?: any;
  faqs?: any[];
  currentStatus: ArticleStatus;
  scheduledAt?: Date | null;
  embargo?: Date | null;
}

export interface PublishResult {
  success: boolean;
  articleId: string;
  status: ArticleStatus;
  slug: string;
  publishedAt: string | null;
  validation: ValidationResult;
  delayed: boolean;
  delayReason?: string;
  scheduledPublishAt?: Date;
}

export class Publisher {
  private readonly validator: Validator;
  private readonly slugGenerator: SlugGenerator;
  private readonly statusMachine: StatusMachine;
  private readonly sanitizer: ContentSanitizer;
  private readonly scheduler: ScheduleManager;

  constructor() {
    this.validator = new Validator();
    this.slugGenerator = new SlugGenerator();
    this.statusMachine = new StatusMachine();
    this.sanitizer = new ContentSanitizer();
    this.scheduler = new ScheduleManager();
  }

  /**
   * Execute the full publish workflow.
   */
  async publish(request: PublishRequest): Promise<PublishResult> {
    const { articleId, currentStatus } = request;

    // 1. Check status transition validity
    const transitionCheck = this.statusMachine.transition(currentStatus, 'PUBLISHED');
    if (!transitionCheck.valid) {
      return {
        success: false,
        articleId,
        status: currentStatus,
        slug: request.slug || '',
        publishedAt: null,
        validation: {
          valid: false,
          errors: [transitionCheck.error || 'Invalid status transition'],
          warnings: [],
          score: 0,
        },
        delayed: false,
      };
    }

    // 2. Sanitize content
    const sanitizedBody = this.sanitizer.sanitize(request.body);
    const summary = request.summary || this.sanitizer.excerpt(sanitizedBody);

    // 3. Generate slug if needed
    const slug = request.slug || this.slugGenerator.generate(request.title);

    // 4. Validate article completeness
    const validation = this.validator.validate({
      ...request,
      body: sanitizedBody,
      summary,
      slug,
    });

    if (!validation.valid) {
      return {
        success: false,
        articleId,
        status: currentStatus,
        slug,
        publishedAt: null,
        validation,
        delayed: false,
      };
    }

    // 5. Check scheduling and embargoes
    const scheduleCheck = this.scheduler.shouldDelay({
      embargo: request.embargo,
      avoidAfterMarketClose: true,
    });

    if (scheduleCheck.delay) {
      return {
        success: false,
        articleId,
        status: currentStatus,
        slug,
        publishedAt: null,
        validation,
        delayed: true,
        delayReason: scheduleCheck.reason,
        scheduledPublishAt: scheduleCheck.publishAt,
      };
    }

    // Check explicit schedule
    if (request.scheduledAt && !this.scheduler.isReadyToPublish(request.scheduledAt)) {
      return {
        success: false,
        articleId,
        status: currentStatus,
        slug,
        publishedAt: null,
        validation,
        delayed: true,
        delayReason: `Scheduled for ${new Date(request.scheduledAt).toISOString()}`,
        scheduledPublishAt: new Date(request.scheduledAt),
      };
    }

    // 6. All checks passed — publish
    const publishedAt = new Date().toISOString();

    // Persist to database
    await prisma.article.update({
      where: { id: articleId },
      data: {
        status: 'PUBLISHED',
        content: sanitizedBody,
        executiveSummary: summary,
        slug,
        publishedAt: new Date(publishedAt),
      },
    });

    // Create audit log entry
    await prisma.auditLog.create({
      data: {
        action: 'ARTICLE_PUBLISHED',
        targetType: 'Article',
        targetId: articleId,
        metadata: {
          slug,
          publishedAt,
          validationScore: validation.score,
        },
      },
    });

    return {
      success: true,
      articleId,
      status: 'PUBLISHED' as ArticleStatus,
      slug,
      publishedAt,
      validation,
      delayed: false,
    };
  }

  /**
   * Send an article to review instead of publishing.
   */
  async sendToReview(
    articleId: string,
    currentStatus: ArticleStatus,
  ): Promise<{ success: boolean; status: ArticleStatus; error?: string }> {
    const transition = this.statusMachine.transition(currentStatus, 'REVIEW');
    if (!transition.valid) {
      return { success: false, status: currentStatus, error: transition.error };
    }

    await prisma.article.update({
      where: { id: articleId },
      data: { status: 'REVIEW' },
    });

    await prisma.auditLog.create({
      data: {
        action: 'ARTICLE_SENT_TO_REVIEW',
        targetType: 'Article',
        targetId: articleId,
        metadata: { from: currentStatus },
      },
    });

    return { success: true, status: 'REVIEW' };
  }

  /**
   * Reject an article from review.
   */
  async reject(
    articleId: string,
    currentStatus: ArticleStatus,
    reason: string,
  ): Promise<{ success: boolean; status: ArticleStatus; error?: string }> {
    const transition = this.statusMachine.transition(currentStatus, 'REJECTED');
    if (!transition.valid) {
      return { success: false, status: currentStatus, error: transition.error };
    }

    await prisma.article.update({
      where: { id: articleId },
      data: { status: 'REJECTED' },
    });

    await prisma.auditLog.create({
      data: {
        action: 'ARTICLE_REJECTED',
        targetType: 'Article',
        targetId: articleId,
        metadata: { from: currentStatus, reason },
      },
    });

    return { success: true, status: 'REJECTED' };
  }

  /**
   * Archive an article.
   */
  async archive(
    articleId: string,
    currentStatus: ArticleStatus,
  ): Promise<{ success: boolean; status: ArticleStatus; error?: string }> {
    const transition = this.statusMachine.transition(currentStatus, 'ARCHIVED');
    if (!transition.valid) {
      return { success: false, status: currentStatus, error: transition.error };
    }

    await prisma.article.update({
      where: { id: articleId },
      data: { status: 'ARCHIVED' },
    });

    await prisma.auditLog.create({
      data: {
        action: 'ARTICLE_ARCHIVED',
        targetType: 'Article',
        targetId: articleId,
        metadata: { from: currentStatus },
      },
    });

    return { success: true, status: 'ARCHIVED' };
  }
}
