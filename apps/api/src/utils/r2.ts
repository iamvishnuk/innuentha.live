import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env.js';
import { randomUUID } from 'crypto';
import path from 'path';

/**
 * S3-compatible client pointed at Cloudflare R2.
 * R2 endpoint format: https://<account-id>.r2.cloudflarestorage.com
 */
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${env.CLOUDFLARE_R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
  }
});

/**
 * Builds the full public CDN URL for a given R2 object key.
 *
 * @param key - R2 object key (e.g. 'event-posters/<uuid>.jpg')
 * @returns Full public URL of the object
 */
export function getPosterUrl(key: string): string {
  return `${env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
}

/**
 * Uploads a file buffer to Cloudflare R2 and returns the R2 object key.
 *
 * @param buffer  - Raw file buffer from multer
 * @param originalName - Original filename (used to extract extension)
 * @param mimeType - MIME type of the file
 * @param folder  - R2 key prefix, e.g. 'event-posters'
 * @returns R2 object key of the uploaded file (e.g. 'event-posters/<uuid>.jpg')
 */
export async function uploadToR2(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  folder: string = 'event-posters'
): Promise<string> {
  const ext = path.extname(originalName) || '.jpg';
  const key = `${folder}/${randomUUID()}${ext}`;

  await r2Client.send(
    new PutObjectCommand({
      Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimeType
    })
  );

  return key;
}
