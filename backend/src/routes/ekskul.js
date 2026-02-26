import express from 'express';
import Ekskul from '../models/Ekskul.js';
import { protect } from '../middleware/auth.js';
import { isAdministrator } from '../middleware/roleCheck.js';
import { uploadSingle, uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// @route   GET /api/ekskul
// @desc    Get all ekskul
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, isActive } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const ekskuls = await Ekskul.find(filter)
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: ekskuls.length,
      data: { ekskuls },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/ekskul/active
// @desc    Get only active ekskul (for public)
// @access  Public
router.get('/active', async (req, res) => {
  try {
    const { category } = req.query;
    
    const filter = { isActive: true };
    if (category) filter.category = category;

    const ekskuls = await Ekskul.find(filter)
      .select('-createdBy')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: ekskuls.length,
      data: { ekskuls },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/ekskul/:id
// @desc    Get single ekskul by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const ekskul = await Ekskul.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!ekskul) {
      return res.status(404).json({
        success: false,
        message: 'Ekskul not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { ekskul },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/ekskul
// @desc    Create new ekskul
// @access  Protected + Admin
router.post('/', protect, isAdministrator, uploadSingle('image'), async (req, res) => {
  try {
    const { name, description, category, coach, schedule, location, achievements } = req.body;

    if (!name || !description || !coach || !schedule) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, description, coach, and schedule',
      });
    }

    const ekskulData = {
      name,
      description,
      category: category || 'lainnya',
      coach,
      schedule,
      location: location || '',
      achievements: Array.isArray(achievements) ? achievements : [],
      createdBy: req.user.id,
    };

    // Upload image to Cloudinary if provided
    if (req.file) {
      try {
        console.log('Uploading ekskul image to Cloudinary...');
        const result = await uploadToCloudinary(req.file.buffer);
        console.log('Cloudinary upload success:', result.secure_url);
        ekskulData.image = result.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        const errorMessage = uploadError?.message || uploadError?.error?.message || JSON.stringify(uploadError) || 'Unknown error';
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image to Cloudinary: ' + errorMessage,
        });
      }
    }

    const ekskul = await Ekskul.create(ekskulData);

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'create',
      resource: 'ekskul',
      resourceId: ekskul._id,
      details: {
        name: ekskul.name,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      success: true,
      message: 'Ekskul created successfully',
      data: { ekskul },
    });
  } catch (error) {
    console.error('Ekskul creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/ekskul/:id
// @desc    Update ekskul
// @access  Protected + Admin
router.put('/:id', protect, isAdministrator, uploadSingle('image'), async (req, res) => {
  try {
    const ekskul = await Ekskul.findById(req.params.id);

    if (!ekskul) {
      return res.status(404).json({
        success: false,
        message: 'Ekskul not found',
      });
    }

    const { name, description, category, coach, schedule, location, achievements, isActive, image } = req.body;

    ekskul.name = name || ekskul.name;
    ekskul.description = description || ekskul.description;
    ekskul.category = category || ekskul.category;
    ekskul.coach = coach || ekskul.coach;
    ekskul.schedule = schedule || ekskul.schedule;
    ekskul.location = location !== undefined ? location : ekskul.location;
    if (achievements !== undefined) {
      ekskul.achievements = Array.isArray(achievements) ? achievements : ekskul.achievements;
    }
    ekskul.isActive = isActive !== undefined ? isActive : ekskul.isActive;

    // Upload new image to Cloudinary if provided
    if (req.file) {
      try {
        console.log('Uploading ekskul image to Cloudinary...');
        const result = await uploadToCloudinary(req.file.buffer);
        console.log('Cloudinary upload success:', result.secure_url);
        ekskul.image = result.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        const errorMessage = uploadError?.message || uploadError?.error?.message || JSON.stringify(uploadError) || 'Unknown error';
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image to Cloudinary: ' + errorMessage,
        });
      }
    } else if (image !== undefined) {
      ekskul.image = image;
    }

    await ekskul.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'ekskul',
      resourceId: ekskul._id,
      details: {
        updatedFields: Object.keys(req.body),
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Ekskul updated successfully',
      data: { ekskul },
    });
  } catch (error) {
    console.error('Ekskul update error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/ekskul/:id
// @desc    Delete ekskul
// @access  Protected + Admin
router.delete('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const ekskul = await Ekskul.findById(req.params.id);

    if (!ekskul) {
      return res.status(404).json({
        success: false,
        message: 'Ekskul not found',
      });
    }

    await ekskul.deleteOne();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'delete',
      resource: 'ekskul',
      resourceId: ekskul._id,
      details: {
        name: ekskul.name,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Ekskul deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PATCH /api/ekskul/:id/toggle-active
// @desc    Toggle ekskul active status
// @access  Protected + Admin
router.patch('/:id/toggle-active', protect, isAdministrator, async (req, res) => {
  try {
    const ekskul = await Ekskul.findById(req.params.id);

    if (!ekskul) {
      return res.status(404).json({
        success: false,
        message: 'Ekskul not found',
      });
    }

    ekskul.isActive = !ekskul.isActive;
    await ekskul.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'ekskul',
      resourceId: ekskul._id,
      details: {
        field: 'isActive',
        newValue: ekskul.isActive,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: `Ekskul ${ekskul.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { ekskul },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
