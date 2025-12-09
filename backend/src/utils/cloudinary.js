import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

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
    // Format: https://res.cloudinary.com/cloud-name/image/upload/v123456/folder/filename.ext
    const matches = url.match(/\/([^\/]+)\.[a-z]+$/i);
    if (matches && matches[1]) {
      return matches[1];
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
