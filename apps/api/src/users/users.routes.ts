import { Router } from 'express';
import { optionalAuth } from '../middlewares/auth.middleware';
import { getUserProfileHandler, updateUserProfileHandler } from './users.controller';

const router = Router();

// Retrieve user profile
router.get('/profile', optionalAuth, getUserProfileHandler);

// Update user profile full name
router.put('/profile', optionalAuth, updateUserProfileHandler);

export const usersRoutes = router;
