import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { optionalAuth } from '../middlewares/auth.middleware';
import { upload } from './events.upload';
import { createEventHandler, getEventsHandler } from './events.controller';

const router = Router();

/**
 * Rate limit for event submissions:
 * Max 5 submissions per IP per hour.
 * Authenticated users are still bound by IP to keep it simple.
 */
const submitRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1-hour window
  max: 5,
  standardHeaders: true,  // Return RateLimit-* headers
  legacyHeaders: false,
  message: {
    error: 'Too many event submissions from this IP. Please try again later.'
  }
});

router.post('/', submitRateLimit, optionalAuth, upload.single('poster'), createEventHandler);
router.get('/', getEventsHandler);

export const eventsRoutes = router;

