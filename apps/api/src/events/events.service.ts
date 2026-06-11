import { and, asc, eq, lt, isNull, getTableColumns } from 'drizzle-orm';
import { db } from '@innuentha/supabase/db';
import { events, profiles } from '@innuentha/supabase/schema';
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
  const posterKey = await uploadToR2(
    file.buffer,
    file.originalname,
    file.mimetype
  );

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

  const results = await db
    .select({
      ...getTableColumns(events),
      user: {
        fullName: profiles.fullName,
        avatarUrl: profiles.avatarUrl
      }
    })
    .from(events)
    .leftJoin(profiles, eq(events.userId, profiles.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(asc(events.startDate));

  return results.map((e) => ({ ...e, posterUrl: getPosterUrl(e.posterUrl) }));
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

  return results.map((e) => ({ ...e, posterUrl: getPosterUrl(e.posterUrl) }));
}

/**
 * Hard-deletes all expired events created anonymously (userId IS NULL).
 *
 * An event is considered expired when its endDate is strictly before today.
 * Returns the number of deleted rows and their R2 poster keys so the
 * caller can clean up the associated media from Cloudflare R2.
 */
export async function deleteExpiredAnonymousEvents(): Promise<{
  deletedCount: number;
  posterKeys: string[];
}> {
  // Use YYYY-MM-DD string comparison — matches the `date` column type in Postgres
  const today = new Date().toISOString().split('T')[0]!;

  const deleted = await db
    .delete(events)
    .where(
      and(
        isNull(events.userId), // anonymous submissions only
        lt(events.endDate, today) // event has already ended
      )
    )
    .returning({ posterUrl: events.posterUrl });

  return {
    deletedCount: deleted.length,
    posterKeys: deleted.map((e) => e.posterUrl)
  };
}
