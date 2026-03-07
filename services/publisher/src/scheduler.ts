/**
 * Schedule Manager
 * =================
 * Manages scheduled and embargoed article publishing.
 */

export class ScheduleManager {
  /**
   * Check if an article is ready to publish based on its schedule.
   */
  isReadyToPublish(scheduledAt: Date | string | null): boolean {
    if (!scheduledAt) return true; // No schedule = publish immediately
    const scheduled = new Date(scheduledAt);
    return new Date() >= scheduled;
  }

  /**
   * Calculate optimal publish time based on historical engagement.
   * Returns next best publish window (weekday, 9-11 AM EST or 2-4 PM EST).
   */
  suggestPublishTime(timezone = 'America/New_York'): Date {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      hour12: false,
    });

    const currentHour = parseInt(formatter.format(now));
    const dayOfWeek = now.getDay(); // 0=Sun, 6=Sat

    // If during prime hours on a weekday, publish now
    const isPrimeHour =
      (currentHour >= 9 && currentHour <= 11) ||
      (currentHour >= 14 && currentHour <= 16);
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

    if (isPrimeHour && isWeekday) {
      return now;
    }

    // Calculate next optimal window
    const target = new Date(now);

    // If it's a weekend, move to Monday
    if (dayOfWeek === 0) target.setDate(target.getDate() + 1); // Sun → Mon
    if (dayOfWeek === 6) target.setDate(target.getDate() + 2); // Sat → Mon

    // If past 4 PM, move to next day
    if (currentHour >= 16) {
      target.setDate(target.getDate() + 1);
      // Skip weekends
      if (target.getDay() === 0) target.setDate(target.getDate() + 1);
      if (target.getDay() === 6) target.setDate(target.getDate() + 2);
    }

    // Set to 9:30 AM EST (prime morning window)
    target.setHours(9, 30, 0, 0);

    return target;
  }

  /**
   * Check if publish should be delayed (embargo, market hours, etc.).
   */
  shouldDelay(params: {
    embargo?: Date | string | null;
    avoidAfterMarketClose?: boolean;
  }): { delay: boolean; reason?: string; publishAt?: Date } {
    // Check embargo
    if (params.embargo) {
      const embargoDate = new Date(params.embargo);
      if (new Date() < embargoDate) {
        return {
          delay: true,
          reason: `Under embargo until ${embargoDate.toISOString()}`,
          publishAt: embargoDate,
        };
      }
    }

    // Check market hours
    if (params.avoidAfterMarketClose) {
      const now = new Date();
      const estHour = parseInt(
        new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/New_York',
          hour: 'numeric',
          hour12: false,
        }).format(now),
      );

      // Avoid publishing after 6 PM EST (post-market)
      if (estHour >= 18 || estHour < 6) {
        return {
          delay: true,
          reason: 'Outside market-adjacent hours',
          publishAt: this.suggestPublishTime(),
        };
      }
    }

    return { delay: false };
  }
}
