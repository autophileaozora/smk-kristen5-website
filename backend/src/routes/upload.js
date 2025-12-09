import express from 'express';
import { protect } from '../middleware/auth.js';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

const router = express.Router();

// @route   POST /api/upload/image
// @desc    Upload single image to Cloudinary
// @access  Private
router.post(
  '/image',
  protect,
  uploadSingle('image'),
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Tidak ada file yang diupload'
        });
      }

      // Get folder from query or use default
      const folder = req.query.folder || 'smk-kristen5/general';

      // Upload to Cloudinary
      const result = await uploadToCloudinary(req.file.buffer, folder);

      res.status(200).json({
        success: true,
        message: 'Gambar berhasil diupload',
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.bytes
        }
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengupload gambar',
        error: error.message
      });
    }
  }
);

export default router;
