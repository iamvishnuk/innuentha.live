import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

// Disable prefetch — required when using Supabase's connection pooler
// in Transaction mode (port 6543)
const client = postgres(process.env.DATABASE_URL!, { prepare: false });

export const db = drizzle(client, { schema });
