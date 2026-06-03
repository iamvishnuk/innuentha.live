import { eq, and, lt } from 'drizzle-orm';
import { db } from '@innuentha/supabase/db';
import { events } from '@innuentha/supabase/schema';
import { logger } from '../utils/logger';
import { DuplicateDetector } from './duplicate-detector';

const detector = new DuplicateDetector();

export class EventWorker {
  private timeout: ReturnType<typeof setTimeout> | null = null;
  private consecutiveFailures = 0;
  private running = false;

  constructor(
    /** How often to poll when healthy (ms) */
    private readonly pollIntervalMs = 30_000,
    /** Min age of a pending event before processing — gives the HTTP response time to finish */
    private readonly processingDelayMs = 5_000,
    /** Maximum backoff cap — 2^n * pollInterval, capped here */
    private readonly maxBackoffMs = 8 * 60 * 1000 // 8 minutes
  ) {}

  start() {
    this.running = true;
    logger.info(`[EventWorker] Started — base poll interval ${this.pollIntervalMs / 1000}s`);
    this.scheduleNext(0); // run immediately on startup
  }

  stop() {
    this.running = false;
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = null;
    }
    logger.info('[EventWorker] Stopped');
  }

  private scheduleNext(delayMs: number) {
    if (!this.running) return;
    this.timeout = setTimeout(() => this.run(), delayMs);
  }

  private async run() {
    if (!this.running) return;
    await this.poll();

    // Exponential backoff on consecutive DB failures; reset to base interval on success
    const nextDelay = this.consecutiveFailures > 0
      ? Math.min(this.pollIntervalMs * Math.pow(2, this.consecutiveFailures), this.maxBackoffMs)
      : this.pollIntervalMs;

    if (this.consecutiveFailures > 0) {
      logger.warn(`[EventWorker] Backing off — next poll in ${nextDelay / 1000}s (failure #${this.consecutiveFailures})`);
    }

    this.scheduleNext(nextDelay);
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

      // Successful DB read — reset failure counter
      this.consecutiveFailures = 0;
    } catch (err) {
      this.consecutiveFailures++;
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
