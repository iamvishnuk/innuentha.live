import type { Request, Response, NextFunction } from 'express';
import { searchLocations, upsertLocation, UpsertLocationSchema } from './locations.service';

/**
 * GET /api/locations/search?q=<query>
 * Searches the cached location table. No auth required.
 */
export async function searchLocationsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const q = (req.query.q as string | undefined)?.trim();
    if (!q || q.length < 2) {
      res.json({ locations: [] });
      return;
    }

    const locations = await searchLocations(q);
    res.json({ locations });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/locations
 * Caches a selected location. Called fire-and-forget after the user
 * selects a result from Google Places or OSM Nominatim.
 */
export async function upsertLocationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = UpsertLocationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors
      });
      return;
    }

    const location = await upsertLocation(parsed.data);
    res.status(201).json({ location });
  } catch (err) {
    next(err);
  }
}
