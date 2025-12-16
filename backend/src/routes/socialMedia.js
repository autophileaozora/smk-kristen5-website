import express from 'express';
import SocialMedia from '../models/SocialMedia.js';
import { protect } from '../middleware/auth.js';
import { isAdministrator } from '../middleware/roleCheck.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// @route   GET /api/social-media
// @desc    Get all social media
// @access  Public
router.get('/', async (req, res) => {
  try {
    const socialMedia = await SocialMedia.find()
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { socialMedia },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/social-media/active
// @desc    Get only active social media
// @access  Public
router.get('/active', async (req, res) => {
  try {
    const socialMedia = await SocialMedia.find({ isActive: true })
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: { socialMedia },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/social-media/:id
// @desc    Get single social media
// @access  Protected
router.get('/:id', protect, async (req, res) => {
  try {
    const socialMedia = await SocialMedia.findById(req.params.id);

    if (!socialMedia) {
      return res.status(404).json({
        success: false,
        message: 'Social media not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { socialMedia },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/social-media
// @desc    Create new social media
// @access  Protected + Admin
router.post('/', protect, isAdministrator, async (req, res) => {
  try {
    const { name, url, icon, order, isActive } = req.body;

    if (!name || !url || !icon) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, url, and icon',
      });
    }

    const socialMedia = await SocialMedia.create({
      name,
      url,
      icon,
      order: order || 1,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user.id,
    });

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'create',
      resource: 'socialMedia',
      resourceId: socialMedia._id,
      details: {
        name: socialMedia.name,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      success: true,
      message: 'Social media created successfully',
      data: { socialMedia },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/social-media/:id
// @desc    Update social media
// @access  Protected + Admin
router.put('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const socialMedia = await SocialMedia.findById(req.params.id);

    if (!socialMedia) {
      return res.status(404).json({
        success: false,
        message: 'Social media not found',
      });
    }

    const { name, url, icon, order, isActive } = req.body;

    socialMedia.name = name || socialMedia.name;
    socialMedia.url = url || socialMedia.url;
    socialMedia.icon = icon || socialMedia.icon;
    socialMedia.order = order !== undefined ? order : socialMedia.order;
    socialMedia.isActive = isActive !== undefined ? isActive : socialMedia.isActive;

    await socialMedia.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'socialMedia',
      resourceId: socialMedia._id,
      details: {
        updatedFields: Object.keys(req.body),
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Social media updated successfully',
      data: { socialMedia },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/social-media/:id
// @desc    Delete social media
// @access  Protected + Admin
router.delete('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const socialMedia = await SocialMedia.findById(req.params.id);

    if (!socialMedia) {
      return res.status(404).json({
        success: false,
        message: 'Social media not found',
      });
    }

    await socialMedia.deleteOne();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'delete',
      resource: 'socialMedia',
      resourceId: req.params.id,
      details: {
        name: socialMedia.name,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Social media deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
