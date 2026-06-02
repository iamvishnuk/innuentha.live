import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '@innuentha/supabase/db';
import { events } from '@innuentha/supabase/schema';
import { optionalAuth } from '../middlewares/auth.middleware.js';
import { getPosterUrl, uploadToR2 } from '../utils/r2.js';

const router = Router();

// Multer — memory storage, 5 MB limit, images only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and WebP images are allowed'));
    }
  }
});

// Zod schema for the non-file form fields (all come in as strings from FormData)
const CreateEventSchema = z.object({
  eventName: z.string().min(1).max(100),
  description: z.string().min(10),
  category: z.string().min(1),
  district: z.string().min(1),
  place: z.string().min(1),
  latitude: z.coerce.number().min(8).max(13),
  longitude: z.coerce.number().min(74).max(78),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  organizerName: z.string().optional(),
  contactNumber: z.string().optional(),
  sourceLink: z.string().optional()
});

/**
 * POST /api/events
 * Submit a new event. Works for both authenticated and anonymous users.
 * Expects multipart/form-data with all form fields + a `poster` file.
 */
router.post(
  '/',
  optionalAuth,
  upload.single('poster'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate non-file fields
      const parsed = CreateEventSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({
          error: 'Validation failed',
          details: parsed.error.flatten().fieldErrors
        });
        return;
      }

      // Poster is required
      if (!req.file) {
        res.status(400).json({ error: 'Event poster is required' });
        return;
      }

      // Upload poster to Cloudflare R2 — store only the object key, not the full URL
      const posterKey = await uploadToR2(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype
      );

      // Insert event row
      const [event] = await db
        .insert(events)
        .values({
          eventName: parsed.data.eventName,
          description: parsed.data.description,
          category: parsed.data.category,
          district: parsed.data.district,
          place: parsed.data.place,
          latitude: parsed.data.latitude,
          longitude: parsed.data.longitude,
          posterUrl: posterKey,
          startDate: parsed.data.startDate,
          endDate: parsed.data.endDate,
          organizerName: parsed.data.organizerName,
          contactNumber: parsed.data.contactNumber,
          sourceLink: parsed.data.sourceLink,
          userId: req.user?.id ?? null
        })
        .returning({ id: events.id, status: events.status });

      res.status(201).json({
        message: 'Event submitted successfully and is pending review.',
        event: { ...event, posterUrl: getPosterUrl(posterKey) }
      });
    } catch (err) {
      next(err);
    }
  }
);

/**
 * GET /api/events
 * Fetch all events with optional filters.
 * Reconstructs the full poster URL from the stored key on the fly.
 */
router.get(
  '/',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { status, category, district } = req.query;

      // Build dynamic where clause using SQL or drizzle expressions
      // Default to returning 'approved' events unless specifically asked for 'all' or another status
      let query = db.select().from(events);

      const conditions = [];

      if (status !== 'all') {
        const statusValue = typeof status === 'string' ? status : 'approved';
        conditions.push(eq(events.status, statusValue));
      }

      if (typeof category === 'string' && category.trim() !== '') {
        conditions.push(eq(events.category, category));
      }

      if (typeof district === 'string' && district.trim() !== '') {
        conditions.push(eq(events.district, district));
      }

      // If we have query filters, apply them
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as typeof query;
      }

      // Order by starting date ascending (soonest first)
      const results = await query.orderBy(asc(events.startDate));

      // Enrich poster keys into full public CDN URLs
      const enrichedEvents = results.map(event => ({
        ...event,
        posterUrl: getPosterUrl(event.posterUrl)
      }));

      res.status(200).json({
        events: enrichedEvents
      });
    } catch (err) {
      next(err);
    }
  }
);

export const eventsRoutes = router;

