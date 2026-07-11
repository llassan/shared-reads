import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config/env';

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export interface UploadImageResult {
  publicId: string;
  url: string;
  secureUrl: string;
}

/**
 * Upload image to Cloudinary
 * @param file - File buffer or base64 string
 * @param folder - Cloudinary folder path
 */
export const uploadImage = async (
  file: Buffer | string,
  folder: string = 'book-listings'
): Promise<UploadImageResult> => {
  try {
    // Convert buffer to base64 if needed
    const fileData =
      Buffer.isBuffer(file) ? `data:image/jpeg;base64,${file.toString('base64')}` : file;

    const result = await cloudinary.uploader.upload(fileData, {
      folder,
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto' },
        { fetch_format: 'auto' },
      ],
    });

    if (config.isDevelopment) {
      console.log(`📸 Image uploaded to Cloudinary: ${result.secure_url}`);
    }

    return {
      publicId: result.public_id,
      url: result.url,
      secureUrl: result.secure_url,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image');
  }
};

/**
 * Upload multiple images
 */
export const uploadMultipleImages = async (
  files: (Buffer | string)[],
  folder: string = 'book-listings'
): Promise<string[]> => {
  const uploadPromises = files.map((file) => uploadImage(file, folder));
  const results = await Promise.all(uploadPromises);
  return results.map((result) => result.secureUrl);
};

/**
 * Delete image from Cloudinary
 */
export const deleteImage = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);

    if (config.isDevelopment) {
      console.log(`🗑️  Image deleted from Cloudinary: ${publicId}`);
    }
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw new Error('Failed to delete image');
  }
};

/**
 * Delete multiple images
 */
export const deleteMultipleImages = async (publicIds: string[]): Promise<void> => {
  const deletePromises = publicIds.map((publicId) => deleteImage(publicId));
  await Promise.all(deletePromises);
};

/**
 * Extract public ID from Cloudinary URL
 */
export const extractPublicId = (url: string): string | null => {
  const match = url.match(/\/v\d+\/(.+)\.\w+$/);
  return match ? match[1] : null;
};
