import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '@innuentha/supabase/db';
import { eventLocations } from '@innuentha/supabase/schema';
import { ilike, or, sql } from 'drizzle-orm';

const router = Router();

/**
 * GET /api/locations/search?q=<query>
 * Search the cached location table. No auth required.
 * MapPicker calls this first before falling back to Google / OSM.
 */
router.get(
  '/search',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const q = (req.query.q as string | undefined)?.trim();
      if (!q || q.length < 2) {
        res.json({ locations: [] });
        return;
      }

      const results = await db
        .select()
        .from(eventLocations)
        .where(
          or(
            ilike(eventLocations.name, `%${q}%`),
            ilike(eventLocations.displayName, `%${q}%`)
          )
        )
        .orderBy(
          // Most frequently used results first
          sql`${eventLocations.usageCount} DESC`
        )
        .limit(5);

      res.json({ locations: results });
    } catch (err) {
      next(err);
    }
  }
);

const UpsertLocationSchema = z.object({
  name: z.string().min(1),
  displayName: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  district: z.string().optional(),
  placeId: z.string().nullable().optional(), // null for OSM entries
  source: z.enum(['google', 'osm', 'manual'])
});

/**
 * POST /api/locations
 * Cache a selected location. Called fire-and-forget after the user selects
 * a result from Google Places or OSM Nominatim.
 *
 * For Google entries: upsert on placeId — increments usageCount on conflict.
 * For OSM entries: plain insert (no unique placeId).
 */
router.post(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = UpsertLocationSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors
        });
        return;
      }

      const data = parsed.data;

      if (data.source === 'google' && data.placeId) {
        // Upsert: increment usageCount if the place already exists
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
            set: {
              usageCount: sql`${eventLocations.usageCount} + 1`
            }
          })
          .returning();

        res.status(201).json({ location });
      } else {
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

        res.status(201).json({ location });
      }
    } catch (err) {
      next(err);
    }
  }
);

export const locationsRoutes = router;
