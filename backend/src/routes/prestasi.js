import express from 'express';
import Prestasi from '../models/Prestasi.js';
import { protect } from '../middleware/auth.js';
import { isAdministrator } from '../middleware/roleCheck.js';
import { uploadSingle, uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// @route   GET /api/prestasi
// @desc    Get all prestasi
// @access  Public
router.get('/', async (req, res) => {
  try {
    const prestasis = await Prestasi.find()
      .populate('createdBy', 'name')
      .sort({ date: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { prestasis },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/prestasi/:id
// @desc    Get single prestasi
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const prestasi = await Prestasi.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!prestasi) {
      return res.status(404).json({
        success: false,
        message: 'Prestasi not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { prestasi },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/prestasi
// @desc    Create new prestasi
// @access  Protected + Admin
router.post('/', protect, isAdministrator, uploadSingle('image'), async (req, res) => {
  try {
    const { title, description, category, level, date, participants, showInRunningText } = req.body;

    if (!title || !description || !date || !participants) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields',
      });
    }

    const prestasiData = {
      title,
      description,
      category: category || 'lainnya',
      level: level || 'sekolah',
      date,
      participants,
      showInRunningText: showInRunningText || false,
      createdBy: req.user.id,
    };

    // Upload image to Cloudinary if provided
    if (req.file) {
      try {
        console.log('Uploading image to Cloudinary...', {
          cloudName: process.env.CLOUDINARY_CLOUD_NAME ? 'Set' : 'Not Set',
          apiKey: process.env.CLOUDINARY_API_KEY ? 'Set' : 'Not Set',
          apiSecret: process.env.CLOUDINARY_API_SECRET ? 'Set' : 'Not Set',
          bufferSize: req.file.buffer.length,
        });
        const result = await uploadToCloudinary(req.file.buffer);
        console.log('Cloudinary upload success:', result.secure_url);
        prestasiData.image = result.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        const errorMessage = uploadError?.message || uploadError?.error?.message || JSON.stringify(uploadError) || 'Unknown error';
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image to Cloudinary: ' + errorMessage,
        });
      }
    }

    const prestasi = await Prestasi.create(prestasiData);

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'create',
      resource: 'prestasi',
      resourceId: prestasi._id,
      details: {
        title: prestasi.title,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      success: true,
      message: 'Prestasi created successfully',
      data: { prestasi },
    });
  } catch (error) {
    console.error('Prestasi creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/prestasi/:id
// @desc    Update prestasi
// @access  Protected + Admin
router.put('/:id', protect, isAdministrator, uploadSingle('image'), async (req, res) => {
  try {
    const prestasi = await Prestasi.findById(req.params.id);

    if (!prestasi) {
      return res.status(404).json({
        success: false,
        message: 'Prestasi not found',
      });
    }

    const { title, description, category, level, date, participants, image, showInRunningText } = req.body;

    prestasi.title = title || prestasi.title;
    prestasi.description = description || prestasi.description;
    prestasi.category = category || prestasi.category;
    prestasi.level = level || prestasi.level;
    prestasi.date = date || prestasi.date;
    prestasi.participants = participants || prestasi.participants;

    // Handle showInRunningText (explicitly check for undefined to allow false value)
    if (showInRunningText !== undefined) {
      prestasi.showInRunningText = showInRunningText;
    }

    // Upload new image to Cloudinary if provided
    if (req.file) {
      try {
        console.log('Uploading image to Cloudinary...');
        const result = await uploadToCloudinary(req.file.buffer);
        console.log('Cloudinary upload success:', result.secure_url);
        prestasi.image = result.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        const errorMessage = uploadError?.message || uploadError?.error?.message || JSON.stringify(uploadError) || 'Unknown error';
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image to Cloudinary: ' + errorMessage,
        });
      }
    } else if (image !== undefined) {
      prestasi.image = image;
    }

    await prestasi.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'prestasi',
      resourceId: prestasi._id,
      details: {
        updatedFields: Object.keys(req.body),
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Prestasi updated successfully',
      data: { prestasi },
    });
  } catch (error) {
    console.error('Prestasi update error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/prestasi/:id
// @desc    Delete prestasi
// @access  Protected + Admin
router.delete('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const prestasi = await Prestasi.findById(req.params.id);

    if (!prestasi) {
      return res.status(404).json({
        success: false,
        message: 'Prestasi not found',
      });
    }

    await prestasi.deleteOne();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'delete',
      resource: 'prestasi',
      resourceId: req.params.id,
      details: {
        title: prestasi.title,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Prestasi deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
