/**
 * Article Status Machine
 * =======================
 * Defines valid status transitions for the article lifecycle.
 *
 * Flow:
 *   RAW → CLASSIFIED → SCORED → DRAFTED → SEO_OPTIMIZED → REVIEW → PUBLISHED
 *                                                            ↓
 *                                                          REJECTED
 *   Any → ARCHIVED
 *   PUBLISHED → UPDATED
 */

export type ArticleStatus =
  | 'RAW'
  | 'CLASSIFIED'
  | 'SCORED'
  | 'DRAFTED'
  | 'SEO_OPTIMIZED'
  | 'REVIEW'
  | 'PUBLISHED'
  | 'REJECTED'
  | 'ARCHIVED'
  | 'UPDATED';

export const TRANSITIONS: Record<ArticleStatus, ArticleStatus[]> = {
  RAW: ['CLASSIFIED', 'ARCHIVED'],
  CLASSIFIED: ['SCORED', 'ARCHIVED'],
  SCORED: ['DRAFTED', 'ARCHIVED'],
  DRAFTED: ['SEO_OPTIMIZED', 'REVIEW', 'ARCHIVED'],
  SEO_OPTIMIZED: ['REVIEW', 'PUBLISHED', 'ARCHIVED'],
  REVIEW: ['PUBLISHED', 'REJECTED', 'DRAFTED', 'ARCHIVED'],
  PUBLISHED: ['UPDATED', 'ARCHIVED'],
  REJECTED: ['DRAFTED', 'ARCHIVED'],
  ARCHIVED: [],
  UPDATED: ['REVIEW', 'PUBLISHED', 'ARCHIVED'],
};

export class StatusMachine {
  /**
   * Check if a transition is valid.
   */
  canTransition(from: ArticleStatus, to: ArticleStatus): boolean {
    return TRANSITIONS[from]?.includes(to) ?? false;
  }

  /**
   * Perform a status transition with validation.
   */
  transition(
    from: ArticleStatus,
    to: ArticleStatus,
  ): { valid: boolean; from: ArticleStatus; to: ArticleStatus; error?: string } {
    if (!TRANSITIONS[from]) {
      return { valid: false, from, to, error: `Unknown status: ${from}` };
    }

    if (!this.canTransition(from, to)) {
      const allowed = TRANSITIONS[from].join(', ');
      return {
        valid: false,
        from,
        to,
        error: `Cannot transition from ${from} to ${to}. Allowed: ${allowed}`,
      };
    }

    return { valid: true, from, to };
  }

  /**
   * Get allowed next states.
   */
  getNextStates(current: ArticleStatus): ArticleStatus[] {
    return TRANSITIONS[current] ?? [];
  }

  /**
   * Check if an article is in a publishable state.
   */
  isPublishable(status: ArticleStatus): boolean {
    return this.canTransition(status, 'PUBLISHED');
  }

  /**
   * Check if an article is in a terminal state.
   */
  isTerminal(status: ArticleStatus): boolean {
    return (TRANSITIONS[status]?.length ?? 0) === 0;
  }
}
