import multer from 'multer';
import { Readable } from 'stream';
// Import configured cloudinary instance from config
import cloudinary from '../config/cloudinary.js';

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
    fileSize: 2 * 1024 * 1024, // 2MB — cukup, gambar dikompresi otomatis oleh Cloudinary
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

// Preset transformasi berdasarkan konteks penggunaan
const PRESETS = {
  // Thumbnail kecil: logo partner, foto alumni, foto profil
  thumbnail: [
    { quality: 'auto:good', fetch_format: 'auto' },
    { width: 400, crop: 'limit' },
  ],
  // Gambar sedang: artikel, prestasi, ekskul
  medium: [
    { quality: 'auto:good', fetch_format: 'auto' },
    { width: 800, crop: 'limit' },
  ],
  // Gambar besar: hero, fasilitas, jurusan, galeri
  large: [
    { quality: 'auto:good', fetch_format: 'auto' },
    { width: 1200, crop: 'limit' },
  ],
};

// Pilih preset otomatis berdasarkan nama folder
const getPreset = (folder) => {
  if (folder.includes('partner') || folder.includes('alumni') || folder.includes('logo')) {
    return PRESETS.thumbnail;
  }
  if (folder.includes('artikel') || folder.includes('article') || folder.includes('prestasi') || folder.includes('ekskul')) {
    return PRESETS.medium;
  }
  return PRESETS.large; // default: hero, fasilitas, jurusan, galeri, dll
};

// Upload buffer to Cloudinary
export const uploadToCloudinary = (buffer, folder = 'smk-kristen5') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
        transformation: getPreset(folder),
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
