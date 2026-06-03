import { and, asc, eq } from 'drizzle-orm';
import { db } from '@innuentha/supabase/db';
import { events } from '@innuentha/supabase/schema';
import { getPosterUrl, uploadToR2 } from '../utils/r2';
import type { TAddEventSchema } from '@innuentha/shared';

/**
 * Server-side event creation payload.
 * Omits `poster` — the file arrives via Multer (req.file), not the request body.
 */
export type CreateEventData = Omit<TAddEventSchema, 'poster'>;

export type GetEventsFilter = {
  status?: string;
  category?: string;
  district?: string;
};

/**
 * Uploads the poster to R2, inserts the event row, and returns the
 * newly created event with a fully resolved poster URL.
 */
export async function createEvent(
  data: CreateEventData,
  file: Express.Multer.File,
  userId: string | null
) {
  const posterKey = await uploadToR2(file.buffer, file.originalname, file.mimetype);

  const [event] = await db
    .insert(events)
    .values({ ...data, posterUrl: posterKey, userId })
    .returning({ id: events.id, status: events.status });

  return { ...event, posterUrl: getPosterUrl(posterKey) };
}

/**
 * Fetches events with optional status / category / district filters.
 * Defaults to returning only 'approved' events.
 * Enriches poster keys into full public CDN URLs.
 */
export async function getEvents(filters: GetEventsFilter) {
  let query = db.select().from(events);
  const conditions = [];

  if (filters.status !== 'all') {
    conditions.push(eq(events.status, filters.status ?? 'approved'));
  }
  if (filters.category?.trim()) {
    conditions.push(eq(events.category, filters.category));
  }
  if (filters.district?.trim()) {
    conditions.push(eq(events.district, filters.district));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as typeof query;
  }

  const results = await query.orderBy(asc(events.startDate));

  return results.map(e => ({ ...e, posterUrl: getPosterUrl(e.posterUrl) }));
}

/**
 * Fetches events submitted by a specific user.
 * Returns all events, including pending and rejected events, for dashboard display.
 */
export async function getUserEvents(userId: string) {
  const results = await db
    .select()
    .from(events)
    .where(eq(events.userId, userId))
    .orderBy(asc(events.startDate));

  return results.map(e => ({ ...e, posterUrl: getPosterUrl(e.posterUrl) }));
}
