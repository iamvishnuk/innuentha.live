import { Cron } from 'croner';
import { eq, and, lt } from 'drizzle-orm';
import { db } from '@innuentha/supabase/db';
import { events } from '@innuentha/supabase/schema';
import { logger } from '../utils/logger';
import { DuplicateDetector } from './duplicate-detector';

const detector = new DuplicateDetector();

export class EventWorker {
  private job: Cron | null = null;

  constructor(
    /**
     * Standard 5-field cron expression.
     * Default: every 30 seconds — '*\/30 * * * * *' (6-field for sub-minute support via croner).
     */
    private readonly cronExpression = '*/30 * * * * *',
    /** Min age of a pending event before processing — gives the HTTP response time to finish */
    private readonly processingDelayMs = 5_000
  ) {}

  start() {
    this.job = new Cron(
      this.cronExpression,
      {
        /**
         * protect: true — prevents overlapping runs.
         * If the poll is still running when the next tick fires,
         * the new tick is silently skipped.
         */
        protect: true,

        /**
         * catch: true — croner catches unhandled errors internally.
         * We also wrap the body in try/catch for structured logging.
         */
        catch: (err: unknown) => {
          logger.error('[EventWorker] Unhandled cron error', err);
        },
      },
      () => this.poll()
    );

    logger.info(
      `[EventWorker] Started — cron: "${this.cronExpression}", processing delay: ${this.processingDelayMs / 1000}s`
    );
  }

  stop() {
    this.job?.stop();
    this.job = null;
    logger.info('[EventWorker] Stopped');
  }

  private async poll() {
    const cutoff = new Date(Date.now() - this.processingDelayMs);

    let pendingEvents;
    try {
      pendingEvents = await db
        .select()
        .from(events)
        .where(
          and(
            eq(events.status, 'pending'),
            lt(events.createdAt, cutoff)
          )
        )
        .orderBy(events.createdAt);
    } catch (err) {
      logger.error('[EventWorker] Failed to fetch pending events', err);
      return;
    }

    if (pendingEvents.length === 0) return;

    logger.info(`[EventWorker] Processing ${pendingEvents.length} pending event(s)`);

    for (const event of pendingEvents) {
      try {
        const result = await detector.check(event);

        if (result.isDuplicate) {
          await db
            .update(events)
            .set({
              status: 'rejected',
              rejectionReason: result.reason,
              updatedAt: new Date(),
            })
            .where(eq(events.id, event.id));

          logger.info(`[EventWorker] Rejected "${event.eventName}" (${event.id}) — ${result.reason}`);
        } else {
          await db
            .update(events)
            .set({ status: 'approved', updatedAt: new Date() })
            .where(eq(events.id, event.id));

          logger.info(`[EventWorker] Approved "${event.eventName}" (${event.id})`);
        }
      } catch (err) {
        // Don't let one event failure block the rest of the queue
        logger.error(`[EventWorker] Error processing event ${event.id}`, err);
      }
    }
  }
}
