import express from 'express';
import CTA from '../models/CTA.js';
import { protect } from '../middleware/auth.js';
import { isAdministrator } from '../middleware/roleCheck.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// @route   GET /api/cta
// @desc    Get all CTAs
// @access  Protected + Admin
router.get('/', protect, isAdministrator, async (req, res) => {
  try {
    const ctas = await CTA.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { ctas },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/cta/active
// @desc    Get active CTA
// @access  Public
router.get('/active', async (req, res) => {
  try {
    const cta = await CTA.findOne({ isActive: true })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { cta },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/cta/:id
// @desc    Get single CTA
// @access  Protected + Admin
router.get('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const cta = await CTA.findById(req.params.id);

    if (!cta) {
      return res.status(404).json({
        success: false,
        message: 'CTA not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { cta },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/cta
// @desc    Create new CTA
// @access  Protected + Admin
router.post('/', protect, isAdministrator, async (req, res) => {
  try {
    const { title, subtitle, buttonText, buttonLink, backgroundImage, backgroundColor, isActive } = req.body;

    if (!title || !buttonText || !buttonLink) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, button text, and button link',
      });
    }

    // If setting this CTA as active, deactivate all others
    if (isActive) {
      await CTA.updateMany({}, { isActive: false });
    }

    const cta = await CTA.create({
      title,
      subtitle: subtitle || '',
      buttonText,
      buttonLink,
      backgroundImage: backgroundImage || null,
      backgroundColor: backgroundColor || '#0D76BE',
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user.id,
    });

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'create',
      resource: 'cta',
      resourceId: cta._id,
      details: {
        title: cta.title,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      success: true,
      message: 'CTA created successfully',
      data: { cta },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/cta/:id
// @desc    Update CTA
// @access  Protected + Admin
router.put('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const cta = await CTA.findById(req.params.id);

    if (!cta) {
      return res.status(404).json({
        success: false,
        message: 'CTA not found',
      });
    }

    const { title, subtitle, buttonText, buttonLink, backgroundImage, backgroundColor, isActive } = req.body;

    // If setting this CTA as active, deactivate all others
    if (isActive && !cta.isActive) {
      await CTA.updateMany({ _id: { $ne: req.params.id } }, { isActive: false });
    }

    cta.title = title || cta.title;
    cta.subtitle = subtitle !== undefined ? subtitle : cta.subtitle;
    cta.buttonText = buttonText || cta.buttonText;
    cta.buttonLink = buttonLink || cta.buttonLink;
    cta.backgroundImage = backgroundImage !== undefined ? backgroundImage : cta.backgroundImage;
    cta.backgroundColor = backgroundColor || cta.backgroundColor;
    cta.isActive = isActive !== undefined ? isActive : cta.isActive;

    await cta.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'cta',
      resourceId: cta._id,
      details: {
        updatedFields: Object.keys(req.body),
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'CTA updated successfully',
      data: { cta },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/cta/:id
// @desc    Delete CTA
// @access  Protected + Admin
router.delete('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const cta = await CTA.findById(req.params.id);

    if (!cta) {
      return res.status(404).json({
        success: false,
        message: 'CTA not found',
      });
    }

    await cta.deleteOne();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'delete',
      resource: 'cta',
      resourceId: req.params.id,
      details: {
        title: cta.title,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'CTA deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
