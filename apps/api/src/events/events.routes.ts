import { Router } from 'express';
import { optionalAuth } from '../middlewares/auth.middleware';
import { upload } from './events.upload';
import { createEventHandler, getEventsHandler } from './events.controller';

const router = Router();

router.post('/', optionalAuth, upload.single('poster'), createEventHandler);
router.get('/', getEventsHandler);

export const eventsRoutes = router;
