import {
  pgTable,
  text,
  timestamp,
  uuid,
  doublePrecision
} from 'drizzle-orm/pg-core';

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

/**
 * Events — stores metadata and coordinates for events happening across Kerala.
 */
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  locationName: text('location_name').notNull(), // e.g. "Kochi", "Thrissur Pooram Ground"
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  eventDate: timestamp('event_date', { withTimezone: true }).notNull(),
  category: text('category').notNull(), // 'Poorams' | 'Perunnals' | 'College Fests' | 'Food Festivals' | 'DJ Events' | 'Other'
  userId: uuid('user_id').references(() => profiles.id, {
    onDelete: 'set null'
  }), // Nullable for anonymous posts
  status: text('status').default('pending').notNull(), // 'pending' | 'approved' | 'rejected'
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
});
