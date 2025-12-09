import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Readable } from 'stream';

// Configure Cloudinary with fallback to hardcoded values
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'drszo9bl2',
  api_key: process.env.CLOUDINARY_API_KEY || '655933234672663',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'azdMIKT382EqxYGiRcmUG7Slsxw',
});

// Show configuration status
console.log('🔧 Cloudinary Config:', {
  cloud_name: cloudinary.config().cloud_name,
  api_key: cloudinary.config().api_key ? 'Set' : 'Not Set',
  api_secret: cloudinary.config().api_secret ? 'Set' : 'Not Set',
  source: process.env.CLOUDINARY_CLOUD_NAME ? '.env file' : 'hardcoded fallback'
});

// Use memory storage
const storage = multer.memoryStorage();

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG, PNG, WebP, and GIF are allowed.'), false);
  }
};

// Base multer upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: imageFilter,
});

// Multer upload middleware for single file
export const uploadSingle = (fieldName = 'image') => {
  return upload.single(fieldName);
};

// Multer upload middleware for multiple fields
export const uploadMultiple = (fields) => {
  return upload.fields(fields);
};

// Upload buffer to Cloudinary
export const uploadToCloudinary = (buffer, folder = 'smk-kristen5') => {
  return new Promise((resolve, reject) => {
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      reject(new Error('Cloudinary credentials not configured. Please check your .env file.'));
      return;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          console.error('Cloudinary upload stream error:', error);
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    const readableStream = new Readable();
    readableStream.push(buffer);
    readableStream.push(null);
    readableStream.pipe(uploadStream);
  });
};

// Delete file from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
};

// Get public ID from Cloudinary URL
export const getPublicIdFromUrl = (url) => {
  if (!url) return null;
  const parts = url.split('/');
  const lastPart = parts[parts.length - 1];
  const publicId = lastPart.split('.')[0];
  const folder = parts[parts.length - 2];
  return `${folder}/${publicId}`;
};

export default {
  uploadSingle,
  uploadMultiple,
  uploadToCloudinary,
  deleteFromCloudinary,
  getPublicIdFromUrl,
  cloudinary,
};
