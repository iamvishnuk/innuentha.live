import { db } from '@innuentha/supabase/db';
import { profiles } from '@innuentha/supabase/schema';
import { eq } from 'drizzle-orm';

/**
 * Fetch a user profile by ID.
 */
export async function getUserProfile(userId: string) {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId));

  return profile || null;
}

/**
 * Update a user profile's full name.
 * The email is not editable and remains unchanged.
 */
export async function updateUserProfile(userId: string, data: { fullName: string }) {
  const [profile] = await db
    .update(profiles)
    .set({
      fullName: data.fullName,
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, userId))
    .returning();

  return profile || null;
}
