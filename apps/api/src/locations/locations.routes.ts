import { Router } from 'express';
import { searchLocationsHandler, upsertLocationHandler } from './locations.controller';

const router = Router();

router.get('/search', searchLocationsHandler);
router.post('/', upsertLocationHandler);

export const locationsRoutes = router;
