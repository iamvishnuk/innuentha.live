import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import postgres from 'postgres';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../../.env');
let envContent = '';
try {
  envContent = fs.readFileSync(envPath, 'utf-8');
} catch (e) {
  console.error('Failed to read .env file at:', envPath);
  process.exit(1);
}

let directUrl = '';
for (const line of envContent.split('\n')) {
  if (line.trim().startsWith('DIRECT_URL=')) {
    directUrl = line
      .split('=')[1]
      .trim()
      .replace(/^["']|["']$/g, '');
    break;
  }
}

if (!directUrl) {
  console.error('DIRECT_URL not found in packages/supabase/.env');
  process.exit(1);
}

const sql = postgres(directUrl);

async function main() {
  console.log('Applying trigger to Supabase DB...');
  try {
    await sql.unsafe(`
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS trigger AS $$
      BEGIN
        INSERT INTO public.profiles (id, full_name, avatar_url, email, created_at, updated_at)
        VALUES (
          new.id,
          coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
          coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'avatar', ''),
          coalesce(new.email, ''),
          new.created_at,
          new.updated_at
        )
        ON CONFLICT (id) DO UPDATE
        SET
          full_name = excluded.full_name,
          avatar_url = excluded.avatar_url,
          email = excluded.email,
          updated_at = now();
        RETURN new;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);
    console.log('- Created/updated function public.handle_new_user()');

    await sql.unsafe(`
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    `);
    await sql.unsafe(`
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW
        EXECUTE FUNCTION public.handle_new_user();
    `);
    console.log('- Created/bound trigger on_auth_user_created to auth.users');
    console.log('✅ Successfully created trigger and function on database!');
  } catch (error) {
    console.error('❌ Error creating trigger:', error);
  } finally {
    await sql.end();
  }
}

main();
