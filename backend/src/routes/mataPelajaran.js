import express from 'express';
import MataPelajaran from '../models/MataPelajaran.js';
import { protect } from '../middleware/auth.js';
import { isAdministrator } from '../middleware/roleCheck.js';
import { uploadSingle, uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// @route   GET /api/mata-pelajaran
// @desc    Get all mata pelajaran (optionally filter by category)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};

    if (category) {
      // If category specified, get items for that category OR public items
      filter.$or = [
        { category: category.toUpperCase() },
        { category: 'PUBLIC' }
      ];
    }

    const mataPelajaran = await MataPelajaran.find(filter)
      .populate('createdBy', 'name')
      .sort({ displayOrder: 1, name: 1 });

    res.status(200).json({
      success: true,
      data: { mataPelajaran },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/mata-pelajaran/active
// @desc    Get only active mata pelajaran
// @access  Public
router.get('/active', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };

    if (category) {
      filter.$or = [
        { category: category.toUpperCase() },
        { category: 'PUBLIC' }
      ];
    }

    const mataPelajaran = await MataPelajaran.find(filter)
      .sort({ displayOrder: 1, name: 1 });

    res.status(200).json({
      success: true,
      data: { mataPelajaran },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/mata-pelajaran/:id
// @desc    Get single mata pelajaran
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const mataPelajaran = await MataPelajaran.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!mataPelajaran) {
      return res.status(404).json({
        success: false,
        message: 'Mata pelajaran not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { mataPelajaran },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/mata-pelajaran
// @desc    Create new mata pelajaran
// @access  Protected + Admin
router.post('/', protect, isAdministrator, uploadSingle('image'), async (req, res) => {
  try {
    const { name, description, category, semester, hoursPerWeek, isActive, displayOrder, image } = req.body;

    if (!name || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, description, and category',
      });
    }

    const mataPelajaranData = {
      name,
      description,
      category: category.toUpperCase(),
      semester: semester || null,
      hoursPerWeek: hoursPerWeek || null,
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: displayOrder || 0,
      createdBy: req.user.id,
    };

    // Upload image to Cloudinary if binary file uploaded, or use URL if provided
    if (req.file) {
      try {
        console.log('Uploading image to Cloudinary...');
        const result = await uploadToCloudinary(req.file.buffer);
        console.log('Image upload success:', result.secure_url);
        mataPelajaranData.image = result.secure_url;
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        const errorMessage = uploadError?.message || uploadError?.error?.message || JSON.stringify(uploadError) || 'Unknown error';
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image to Cloudinary: ' + errorMessage,
        });
      }
    } else if (image) {
      mataPelajaranData.image = image;
    }

    const mataPelajaran = await MataPelajaran.create(mataPelajaranData);

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'create',
      resource: 'mataPelajaran',
      resourceId: mataPelajaran._id,
      details: {
        name: mataPelajaran.name,
        category: mataPelajaran.category,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      success: true,
      message: 'Mata pelajaran created successfully',
      data: { mataPelajaran },
    });
  } catch (error) {
    console.error('Mata pelajaran creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/mata-pelajaran/:id
// @desc    Update mata pelajaran
// @access  Protected + Admin
router.put('/:id', protect, isAdministrator, uploadSingle('image'), async (req, res) => {
  try {
    const mataPelajaran = await MataPelajaran.findById(req.params.id);

    if (!mataPelajaran) {
      return res.status(404).json({
        success: false,
        message: 'Mata pelajaran not found',
      });
    }

    const { name, description, category, semester, hoursPerWeek, isActive, displayOrder, image } = req.body;

    mataPelajaran.name = name || mataPelajaran.name;
    mataPelajaran.description = description || mataPelajaran.description;
    mataPelajaran.category = category ? category.toUpperCase() : mataPelajaran.category;
    mataPelajaran.semester = semester !== undefined ? semester : mataPelajaran.semester;
    mataPelajaran.hoursPerWeek = hoursPerWeek !== undefined ? hoursPerWeek : mataPelajaran.hoursPerWeek;
    mataPelajaran.isActive = isActive !== undefined ? isActive : mataPelajaran.isActive;
    mataPelajaran.displayOrder = displayOrder !== undefined ? displayOrder : mataPelajaran.displayOrder;

    // Upload new image to Cloudinary if provided
    if (req.file) {
      try {
        console.log('Uploading image to Cloudinary...');
        const result = await uploadToCloudinary(req.file.buffer);
        console.log('Image upload success:', result.secure_url);
        mataPelajaran.image = result.secure_url;
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        const errorMessage = uploadError?.message || uploadError?.error?.message || JSON.stringify(uploadError) || 'Unknown error';
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image to Cloudinary: ' + errorMessage,
        });
      }
    } else if (image !== undefined) {
      mataPelajaran.image = image;
    }

    await mataPelajaran.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'mataPelajaran',
      resourceId: mataPelajaran._id,
      details: {
        updatedFields: Object.keys(req.body),
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Mata pelajaran updated successfully',
      data: { mataPelajaran },
    });
  } catch (error) {
    console.error('Mata pelajaran update error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/mata-pelajaran/:id
// @desc    Delete mata pelajaran
// @access  Protected + Admin
router.delete('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const mataPelajaran = await MataPelajaran.findById(req.params.id);

    if (!mataPelajaran) {
      return res.status(404).json({
        success: false,
        message: 'Mata pelajaran not found',
      });
    }

    await mataPelajaran.deleteOne();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'delete',
      resource: 'mataPelajaran',
      resourceId: req.params.id,
      details: {
        name: mataPelajaran.name,
        category: mataPelajaran.category,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Mata pelajaran deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
