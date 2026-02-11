import express from 'express';
import mammoth from 'mammoth';
import { protect } from '../middleware/auth.js';
import { uploadSingle, handleUploadError } from '../middleware/upload.js';
import { uploadToCloudinary } from '../utils/cloudinaryUpload.js';

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

// @route   POST /api/upload/parse-document
// @desc    Upload and parse DOCX/DOC/PDF file to HTML
// @access  Private
router.post(
  '/parse-document',
  protect,
  uploadSingle('document'),
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Tidak ada file yang diupload'
        });
      }

      const mimetype = req.file.mimetype;
      const filename = req.file.originalname.toLowerCase();
      let html = '';
      let warnings = [];

      // Check if it's a Word document
      const isWord = mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                     mimetype === 'application/msword' ||
                     filename.endsWith('.docx') ||
                     filename.endsWith('.doc');

      // Only Word documents are supported for now
      if (!isWord) {
        return res.status(400).json({
          success: false,
          message: 'Format file tidak didukung. Gunakan file .docx atau .doc'
        });
      }

      if (isWord) {
        // Parse DOCX/DOC to HTML using mammoth
        const result = await mammoth.convertToHtml(
          { buffer: req.file.buffer },
          {
            styleMap: [
              "p[style-name='Heading 1'] => h1:fresh",
              "p[style-name='Heading 2'] => h2:fresh",
              "p[style-name='Heading 3'] => h3:fresh",
              "p[style-name='Title'] => h1.title:fresh",
              "b => strong",
              "i => em",
              "u => u",
              "strike => del",
            ]
          }
        );

        html = result.value;
        warnings = result.messages;

        // Clean up the HTML
        html = html.replace(/<p>\s*<\/p>/g, '');
        html = html.replace(/<\/h1>/g, '</h1>\n');
        html = html.replace(/<\/h2>/g, '</h2>\n');
        html = html.replace(/<\/h3>/g, '</h3>\n');
        html = html.replace(/<\/p>/g, '</p>\n');

      }

      res.status(200).json({
        success: true,
        message: 'Dokumen berhasil diparse',
        data: {
          html: html,
          fileType: 'word',
          warnings: warnings
        }
      });
    } catch (error) {
      console.error('Parse document error:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal memproses dokumen',
        error: error.message
      });
    }
  }
);

export default router;
