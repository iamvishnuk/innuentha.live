import { Request, Response, NextFunction } from 'express';
import { getUserProfile, updateUserProfile } from './users.service';

/**
 * GET /api/users/profile
 * Get authenticated user's profile.
 */
export async function getUserProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const profile = await getUserProfile(req.user.id);
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    res.status(200).json({ profile });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/users/profile
 * Update authenticated user's profile full name.
 */
export async function updateUserProfileHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { fullName } = req.body;
    if (typeof fullName !== 'string' || !fullName.trim()) {
      res.status(400).json({ error: 'Full name is required' });
      return;
    }

    const profile = await updateUserProfile(req.user.id, {
      fullName: fullName.trim()
    });

    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      profile
    });
  } catch (err) {
    next(err);
  }
}
