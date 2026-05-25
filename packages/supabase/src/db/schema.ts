import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/**
 * User profiles — extends Supabase Auth's `auth.users` table.
 *
 * The `id` column references the Supabase Auth user ID so you can
 * link profile data to the authenticated user.
 */
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // matches auth.users.id
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  email: text('email').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
});
