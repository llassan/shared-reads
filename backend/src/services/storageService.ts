import { randomUUID } from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';

/**
 * Self-hosted image storage.
 * Images are processed with sharp (EXIF stripped, auto-rotated, capped at
 * 1600px, re-encoded as webp) and written under UPLOAD_DIR. They are served
 * as static files at /uploads/* by nginx in production (Cloudflare caches
 * them at the edge) and by express in development.
 */

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
const URL_PREFIX = '/uploads';

const ALLOWED_FOLDERS = new Set(['book-listings', 'transaction-evidence', 'dispute-evidence', 'profiles']);

export interface UploadImageResult {
  publicId: string;
  url: string;
  secureUrl: string;
}

const toBuffer = (file: Buffer | string): Buffer => {
  if (Buffer.isBuffer(file)) return file;
  // data URL or bare base64 payload
  const base64 = file.replace(/^data:image\/\w+;base64,/, '');
  return Buffer.from(base64, 'base64');
};

/**
 * Process and store one image.
 * @param file - File buffer, data URL, or base64 string
 * @param folder - subfolder under the upload root
 */
export const uploadImage = async (
  file: Buffer | string,
  folder: string = 'book-listings'
): Promise<UploadImageResult> => {
  if (!ALLOWED_FOLDERS.has(folder)) {
    throw new Error(`Unknown upload folder: ${folder}`);
  }
  try {
    const input = toBuffer(file);
    // sharp validates the payload is a real image; rotate() applies EXIF
    // orientation, and metadata (including GPS) is stripped by default.
    const processed = await sharp(input)
      .rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    const publicId = `${folder}/${randomUUID()}.webp`;
    const filePath = path.join(UPLOAD_DIR, publicId);
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, processed);

    const url = `${URL_PREFIX}/${publicId}`;
    return { publicId, url, secureUrl: url };
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Failed to upload image');
  }
};

export const uploadMultipleImages = async (
  files: (Buffer | string)[],
  folder: string = 'book-listings'
): Promise<string[]> => {
  const results = await Promise.all(files.map((file) => uploadImage(file, folder)));
  return results.map((result) => result.secureUrl);
};

export const deleteImage = async (publicId: string): Promise<void> => {
  // publicId is always "<folder>/<uuid>.webp" — refuse anything that could
  // escape the upload root.
  const normalized = path.normalize(publicId);
  if (normalized.startsWith('..') || path.isAbsolute(normalized)) return;
  try {
    await fs.unlink(path.join(UPLOAD_DIR, normalized));
  } catch (error: any) {
    if (error.code !== 'ENOENT') {
      console.error('Image delete error:', error);
    }
  }
};

export const deleteMultipleImages = async (publicIds: string[]): Promise<void> => {
  await Promise.all(publicIds.map((publicId) => deleteImage(publicId)));
};

/**
 * Extract the storage public ID from a served URL.
 * Handles both self-hosted (/uploads/...) and legacy Cloudinary URLs.
 */
export const extractPublicId = (url: string): string | null => {
  if (url.startsWith(`${URL_PREFIX}/`)) {
    return url.slice(URL_PREFIX.length + 1);
  }
  const cloudinaryMatch = url.match(/\/v\d+\/(.+)\.\w+$/);
  return cloudinaryMatch ? cloudinaryMatch[1] : null;
};
