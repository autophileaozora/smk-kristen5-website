import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with direct values (env variables not loaded yet during ES6 imports)
cloudinary.config({
  cloud_name: 'drszo9bl2',
  api_key: '655933234672663',
  api_secret: 'azdMIKT382EqxYGiRcmUG7Slsxw',
  secure: true,
});

console.log('✅ Cloudinary configured successfully');

/**
 * Upload image to Cloudinary
 * @param {Buffer} fileBuffer - Image buffer
 * @param {String} folder - Cloudinary folder name
 * @returns {Promise<Object>} - Upload result with URL
 */
export const uploadImage = async (fileBuffer, folder = 'smk-kristen5') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }, // Auto optimize
          { width: 1200, crop: 'limit' }, // Max width 1200px
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Upload video to Cloudinary
 * @param {Buffer} fileBuffer - Video buffer
 * @param {String} folder - Cloudinary folder name
 * @returns {Promise<Object>} - Upload result with URL
 */
export const uploadVideo = async (fileBuffer, folder = 'smk-kristen5/videos') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'video',
        transformation: [
          { quality: 'auto' },
          { width: 1280, crop: 'limit' }, // Max width 1280px
        ],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

/**
 * Delete file from Cloudinary
 * @param {String} publicId - Cloudinary public ID
 * @param {String} resourceType - 'image' or 'video'
 * @returns {Promise<Object>} - Delete result
 */
export const deleteFile = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    return result;
  } catch (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};

export default cloudinary;
