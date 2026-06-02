import { Request, Response, NextFunction } from 'express';
import { AddEventSchema } from '@innuentha/shared';
import { createEvent, getEvents } from './events.service';

/**
 * Server-side schema: omit the `poster` field which uses the browser File API.
 * The uploaded file is validated separately via Multer (req.file).
 */
const ServerCreateEventSchema = AddEventSchema.omit({ poster: true });

/**
 * POST /api/events
 * Submit a new event. Works for both authenticated and anonymous users.
 * Expects multipart/form-data with all form fields + a `poster` file.
 */
export async function createEventHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const parsed = ServerCreateEventSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    if (!req.file) {
      res.status(400).json({ error: 'Event poster is required' });
      return;
    }

    const event = await createEvent(parsed.data, req.file, req.user?.id ?? null);

    res.status(201).json({
      message: 'Event submitted successfully and is pending review.',
      event,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/events
 * Fetch events with optional status / category / district filters.
 */
export async function getEventsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { status, category, district } = req.query;

    const events = await getEvents({
      status: typeof status === 'string' ? status : undefined,
      category: typeof category === 'string' ? category : undefined,
      district: typeof district === 'string' ? district : undefined,
    });

    res.status(200).json({ events });
  } catch (err) {
    next(err);
  }
}
