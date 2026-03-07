/**
 * Slug Generator
 * ===============
 * Generates unique, SEO-friendly URL slugs for articles.
 */

import slugify from 'slugify';

export class SlugGenerator {
  private readonly maxLength: number;

  constructor(maxLength = 80) {
    this.maxLength = maxLength;
  }

  /**
   * Generate a slug from an article title.
   */
  generate(title: string): string {
    // Remove common filler words for cleaner slugs
    const cleaned = this.removeStopwords(title);

    let slug = slugify(cleaned, {
      lower: true,
      strict: true,
      trim: true,
    });

    // Enforce max length at word boundary
    if (slug.length > this.maxLength) {
      slug = slug.slice(0, this.maxLength);
      const lastHyphen = slug.lastIndexOf('-');
      if (lastHyphen > this.maxLength * 0.5) {
        slug = slug.slice(0, lastHyphen);
      }
    }

    return slug;
  }

  /**
   * Generate a slug with a date prefix for chronological ordering.
   */
  generateDated(title: string, date: Date = new Date()): string {
    const datePrefix = date.toISOString().slice(0, 10); // YYYY-MM-DD
    const titleSlug = this.generate(title);

    // Trim title slug to fit within max length with date
    const maxTitleLength = this.maxLength - datePrefix.length - 1;
    const trimmedSlug = titleSlug.slice(0, maxTitleLength);

    return `${datePrefix}-${trimmedSlug}`;
  }

  /**
   * Generate a unique slug by appending a counter if needed.
   */
  async generateUnique(
    title: string,
    existsCheck: (slug: string) => Promise<boolean>,
  ): Promise<string> {
    const baseSlug = this.generate(title);

    if (!(await existsCheck(baseSlug))) {
      return baseSlug;
    }

    // Try appending incrementing numbers
    for (let i = 2; i <= 100; i++) {
      const candidate = `${baseSlug}-${i}`;
      if (!(await existsCheck(candidate))) {
        return candidate;
      }
    }

    // Fallback: append timestamp
    const timestamp = Date.now().toString(36);
    return `${baseSlug}-${timestamp}`;
  }

  /**
   * Remove common English stop words from title for cleaner slugs.
   */
  private removeStopwords(text: string): string {
    const stopwords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'could', 'should', 'may', 'might', 'shall', 'can', 'its', 'it',
      'this', 'that', 'these', 'those', 'into', 'than', 'then', 'not',
    ]);

    const words = text.split(/\s+/);

    // Don't strip stopwords if it would remove all words
    const filtered = words.filter((w) => !stopwords.has(w.toLowerCase()));
    return filtered.length > 0 ? filtered.join(' ') : text;
  }
}
