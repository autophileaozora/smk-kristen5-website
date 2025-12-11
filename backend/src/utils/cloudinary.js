import { Readable } from 'stream';
// Import configured cloudinary instance from config
import cloudinary from '../config/cloudinary.js';

/**
 * Upload image to Cloudinary from buffer
 * @param {Buffer} buffer - Image buffer
 * @param {string} folder - Cloudinary folder name
 * @param {string} publicId - Optional custom public ID
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export const uploadToCloudinary = (buffer, folder = 'smk-kristen5', publicId = null) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: folder,
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        { quality: 'auto' },
        { fetch_format: 'auto' }
      ]
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Convert buffer to readable stream and pipe to Cloudinary
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<Object>} - Cloudinary delete result
 */
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Failed to delete image: ${error.message}`);
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string} - Public ID
 */
export const extractPublicId = (url) => {
  if (!url) return null;

  try {
    // Extract public ID from Cloudinary URL
    // Format: https://res.cloudinary.com/cloud-name/image/upload/v123456/folder/subfolder/filename.ext
    // Public ID should be: folder/subfolder/filename (without extension)

    // Match everything after /upload/v[numbers]/ until the file extension
    const uploadPattern = /\/upload\/v\d+\/(.+)\.[a-z]+$/i;
    const uploadMatch = url.match(uploadPattern);

    if (uploadMatch && uploadMatch[1]) {
      return uploadMatch[1];
    }

    // Fallback: Match everything after /upload/ until the file extension
    const fallbackPattern = /\/upload\/(.+)\.[a-z]+$/i;
    const fallbackMatch = url.match(fallbackPattern);

    if (fallbackMatch && fallbackMatch[1]) {
      // Remove version prefix if exists (v123456/)
      return fallbackMatch[1].replace(/^v\d+\//, '');
    }

    return null;
  } catch (error) {
    return null;
  }
};

export default {
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicId
};
