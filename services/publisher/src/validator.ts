/**
 * Content Validator
 * ==================
 * Validates articles before publication, ensuring all
 * required fields are present and meet quality standards.
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  score: number; // 0-100 completeness score
}

interface ArticleData {
  title?: string;
  seoTitle?: string;
  body?: string;
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
  publishedAt?: string | null;
}

export class Validator {
  private readonly MIN_TITLE_LENGTH = 20;
  private readonly MAX_TITLE_LENGTH = 120;
  private readonly MIN_SEO_TITLE_LENGTH = 30;
  private readonly MAX_SEO_TITLE_LENGTH = 70;
  private readonly MIN_BODY_LENGTH = 200;
  private readonly MIN_SUMMARY_LENGTH = 50;
  private readonly MAX_META_DESC_LENGTH = 165;
  private readonly MIN_META_DESC_LENGTH = 120;
  private readonly MIN_SCORE_FOR_PUBLISH = 3.0;

  /**
   * Run full validation suite on an article.
   */
  validate(article: ArticleData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let points = 0;
    let maxPoints = 0;

    // ─── Required Fields ──────────────────────────

    // Title
    maxPoints += 10;
    if (!article.title) {
      errors.push('Missing title');
    } else if (article.title.length < this.MIN_TITLE_LENGTH) {
      errors.push(`Title too short (${article.title.length} chars, min ${this.MIN_TITLE_LENGTH})`);
    } else if (article.title.length > this.MAX_TITLE_LENGTH) {
      warnings.push(`Title long (${article.title.length} chars, max ${this.MAX_TITLE_LENGTH})`);
      points += 7;
    } else {
      points += 10;
    }

    // Body
    maxPoints += 15;
    if (!article.body) {
      errors.push('Missing body content');
    } else if (article.body.length < this.MIN_BODY_LENGTH) {
      errors.push(`Body too short (${article.body.length} chars, min ${this.MIN_BODY_LENGTH})`);
    } else {
      points += 15;
    }

    // Summary
    maxPoints += 10;
    if (!article.summary) {
      errors.push('Missing summary');
    } else if (article.summary.length < this.MIN_SUMMARY_LENGTH) {
      warnings.push(`Summary short (${article.summary.length} chars)`);
      points += 5;
    } else {
      points += 10;
    }

    // Slug
    maxPoints += 10;
    if (!article.slug) {
      errors.push('Missing URL slug');
    } else if (!/^[a-z0-9-]+$/.test(article.slug)) {
      errors.push('Invalid slug format (must be lowercase alphanumeric with hyphens)');
    } else {
      points += 10;
    }

    // Primary topic
    maxPoints += 10;
    if (!article.primaryTopic) {
      errors.push('Missing primary topic classification');
    } else {
      points += 10;
    }

    // Credibility
    maxPoints += 5;
    if (!article.credibilityTier) {
      errors.push('Missing credibility tier');
    } else {
      points += 5;
    }

    // Source
    maxPoints += 5;
    if (!article.source) {
      errors.push('Missing source attribution');
    } else {
      points += 5;
    }

    // ─── SEO Fields ───────────────────────────────

    // SEO Title
    maxPoints += 10;
    if (!article.seoTitle) {
      warnings.push('Missing SEO title — will fall back to main title');
      points += 3;
    } else if (
      article.seoTitle.length < this.MIN_SEO_TITLE_LENGTH ||
      article.seoTitle.length > this.MAX_SEO_TITLE_LENGTH
    ) {
      warnings.push(
        `SEO title length ${article.seoTitle.length} (ideal: ${this.MIN_SEO_TITLE_LENGTH}-${this.MAX_SEO_TITLE_LENGTH})`,
      );
      points += 6;
    } else {
      points += 10;
    }

    // Meta description
    maxPoints += 10;
    if (!article.metaDescription) {
      warnings.push('Missing meta description');
    } else if (
      article.metaDescription.length < this.MIN_META_DESC_LENGTH ||
      article.metaDescription.length > this.MAX_META_DESC_LENGTH
    ) {
      warnings.push(
        `Meta description length ${article.metaDescription.length} (ideal: ${this.MIN_META_DESC_LENGTH}-${this.MAX_META_DESC_LENGTH})`,
      );
      points += 6;
    } else {
      points += 10;
    }

    // ─── Intelligence Fields ──────────────────────

    // Signal scores
    maxPoints += 10;
    if (!article.overallScore) {
      warnings.push('Missing signal scores');
    } else if (article.overallScore < this.MIN_SCORE_FOR_PUBLISH) {
      warnings.push(
        `Low signal score (${article.overallScore}, threshold: ${this.MIN_SCORE_FOR_PUBLISH})`,
      );
      points += 5;
    } else {
      points += 10;
    }

    // Entities
    maxPoints += 5;
    if (!article.entities || article.entities.length === 0) {
      warnings.push('No entities extracted');
    } else {
      points += 5;
    }

    // FAQs for structured data
    if (article.faqs && article.faqs.length > 0) {
      points += 2; // Bonus points
    }

    const score = Math.round((points / maxPoints) * 100);

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      score,
    };
  }

  /**
   * Quick check if article is ready for publication.
   */
  isPublishReady(article: ArticleData): boolean {
    const result = this.validate(article);
    return result.valid && result.score >= 60;
  }
}
