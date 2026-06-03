import dotenv from 'dotenv'
import { z } from "zod";

dotenv.config()

const envSchema = z.object({
  PORT: z.coerce.number().default(3001),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().url().describe("PostgreSQL connection URL"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  // Supabase — used by optionalAuth middleware for JWT verification
  SUPABASE_URL: z.string().url(),
  SUPABASE_PUBLISHABLE_KEY: z.string(),
  // Cloudflare R2 — S3-compatible object storage for event posters
  CLOUDFLARE_R2_ACCOUNT_ID: z.string(),
  CLOUDFLARE_R2_ACCESS_KEY_ID: z.string(),
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string(),
  CLOUDFLARE_R2_BUCKET_NAME: z.string(),
  CLOUDFLARE_R2_PUBLIC_URL: z.string().url(),
  // Error tracking — optional, Sentry is skipped if not set
  SENTRY_DSN: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;
