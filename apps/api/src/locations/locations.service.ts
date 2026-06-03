import { z } from 'zod';
import { db } from '@innuentha/supabase/db';
import { eventLocations } from '@innuentha/supabase/schema';
import { ilike, or, sql } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
export const UpsertLocationSchema = z.object({
  name: z.string().min(1),
  displayName: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  district: z.string().optional(),
  placeId: z.string().nullable().optional(),
  source: z.enum(['google', 'osm', 'manual'])
});

export type UpsertLocationInput = z.infer<typeof UpsertLocationSchema>;

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

/**
 * Search cached locations by name or displayName.
 * Returns up to 5 results ordered by usage frequency.
 */
export async function searchLocations(query: string) {
  return db
    .select()
    .from(eventLocations)
    .where(
      or(
        ilike(eventLocations.name, `%${query}%`),
        ilike(eventLocations.displayName, `%${query}%`)
      )
    )
    .orderBy(sql`${eventLocations.usageCount} DESC`)
    .limit(5);
}

/**
 * Cache a location after the user selects it from Google Places or OSM.
 * - Google entries: upsert on placeId, increment usageCount on conflict.
 * - OSM / manual: plain insert (no unique placeId to upsert on).
 */
export async function upsertLocation(data: UpsertLocationInput) {
  if (data.source === 'google' && data.placeId) {
    const [location] = await db
      .insert(eventLocations)
      .values({
        name: data.name,
        displayName: data.displayName,
        latitude: data.latitude,
        longitude: data.longitude,
        district: data.district,
        placeId: data.placeId,
        source: data.source
      })
      .onConflictDoUpdate({
        target: eventLocations.placeId,
        set: { usageCount: sql`${eventLocations.usageCount} + 1` }
      })
      .returning();

    return location!;
  }

  // OSM / manual — plain insert
  const [location] = await db
    .insert(eventLocations)
    .values({
      name: data.name,
      displayName: data.displayName,
      latitude: data.latitude,
      longitude: data.longitude,
      district: data.district,
      placeId: null,
      source: data.source
    })
    .returning();

  return location!;
}
