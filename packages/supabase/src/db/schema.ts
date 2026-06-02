import {
  pgTable,
  text,
  timestamp,
  uuid,
  doublePrecision,
  integer,
  date
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
export type TProfile = typeof profiles.$inferSelect;

/**
 * Events — stores all fields submitted through the Add Event form.
 *
 * `userId` is nullable so both authenticated and anonymous users can submit.
 * `status` defaults to 'pending' until an admin approves or rejects.
 */
export const events = pgTable('events', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventName: text('event_name').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull(), // EventCategory enum value
  district: text('district').notNull(),
  place: text('place').notNull(), // venue / location label typed by user
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  posterUrl: text('poster_url').notNull(), // Cloudflare R2 object key (e.g. 'event-posters/<uuid>.jpg') — use getPosterUrl() to build the full URL
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  organizerName: text('organizer_name'),
  contactNumber: text('contact_number'),
  sourceLink: text('source_link'),
  userId: uuid('user_id').references(() => profiles.id, {
    onDelete: 'set null'
  }), // Nullable — anonymous submissions allowed
  status: text('status').default('pending').notNull(), // 'pending' | 'approved' | 'rejected'
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull()
});
export type TEvent = typeof events.$inferSelect;

/**
 * Event Locations cache — stores places that users have selected via the map
 * picker so we can serve them from our own DB before hitting the Google Places
 * API, reducing autocomplete billing costs.
 *
 * For Google-sourced entries `placeId` is set and used as the upsert key.
 * For OSM-sourced entries `placeId` is null.
 */
export const eventLocations = pgTable('event_locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(), // short display name, e.g. "Talap Sree Sundareswarar Temple"
  displayName: text('display_name').notNull(), // full prediction text shown in dropdown
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  district: text('district'), // optional — inferred from the location if available
  placeId: text('place_id').unique(), // Google Place ID; null for OSM entries
  source: text('source').notNull(), // 'google' | 'osm' | 'manual'
  usageCount: integer('usage_count').default(1).notNull(), // incremented on each cache hit
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull()
});
export type TEventLocation = typeof eventLocations.$inferSelect;
