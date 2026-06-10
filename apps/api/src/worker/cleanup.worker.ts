import { Cron } from 'croner';
import { deleteExpiredAnonymousEvents } from '../events/events.service';
import { deleteFromR2 } from '../utils/r2';
import { logger } from '../utils/logger';

/**
 * CleanupWorker — runs a cron job every day at IST midnight (18:30 UTC)
 * to hard-delete expired anonymous events (userId IS NULL, endDate < today)
 * and their associated Cloudflare R2 poster images.
 *
 * Verified-user events are intentionally kept — they belong to registered
 * organisers who may want to view their event history on the dashboard.
 *
 * Cron schedule: '30 18 * * *'
 *   → 18:30 UTC = 00:00 IST (Asia/Kolkata, UTC+5:30)
 */
export class CleanupWorker {
  private job: Cron | null = null;

  constructor(
    /**
     * Standard 5-field cron expression.
     * Default: '30 18 * * *' → IST midnight (00:00 IST = 18:30 UTC)
     */
    private readonly cronExpression = '30 18 * * *'
  ) {}

  start() {
    this.job = new Cron(
      this.cronExpression,
      {
        /**
         * protect: true — prevents overlapping runs.
         * If the cleanup job is still running when the next trigger fires,
         * the new trigger is silently skipped.
         */
        protect: true,

        /**
         * catch: true — croner catches unhandled errors internally.
         * We also wrap the body in try/catch for structured logging.
         */
        catch: (err: unknown) => {
          logger.error('[CleanupWorker] Unhandled cron error', err);
        }
      },
      () => this.run()
    );

    logger.info(
      `[CleanupWorker] Scheduled — cron: "${this.cronExpression}" (IST midnight / 18:30 UTC)`
    );
  }

  stop() {
    this.job?.stop();
    this.job = null;
    logger.info('[CleanupWorker] Stopped');
  }

  /**
   * Core cleanup logic:
   * 1. Delete expired anonymous event rows from Postgres.
   * 2. Delete their poster images from Cloudflare R2 in parallel.
   * 3. Log a summary (deletions + R2 failures, if any).
   */
  private async run() {
    logger.info('[CleanupWorker] Running expired anonymous event cleanup...');

    try {
      const { deletedCount, posterKeys } = await deleteExpiredAnonymousEvents();

      if (deletedCount === 0) {
        logger.info(
          '[CleanupWorker] No expired anonymous events found — nothing to clean up.'
        );
        return;
      }

      // Delete R2 poster images concurrently.
      // allSettled ensures one R2 failure doesn't abort the rest.
      const r2Results = await Promise.allSettled(
        posterKeys.map((key) => deleteFromR2(key))
      );

      const r2Success = r2Results.filter(
        (r) => r.status === 'fulfilled'
      ).length;
      const r2Failures = r2Results.filter((r) => r.status === 'rejected');

      logger.info(
        `[CleanupWorker] Done — deleted ${deletedCount} event(s) from DB, ` +
          `${r2Success} R2 image(s) deleted` +
          (r2Failures.length > 0
            ? `, ${r2Failures.length} R2 deletion(s) failed`
            : '.')
      );

      // Log individual R2 failures so they can be investigated
      r2Failures.forEach((failure, idx) => {
        if (failure.status === 'rejected') {
          logger.warn(
            `[CleanupWorker] R2 delete failed for key[${idx}]`,
            failure.reason
          );
        }
      });
    } catch (err) {
      logger.error('[CleanupWorker] Cleanup job failed unexpectedly', err);
    }
  }
}
