import express from 'express';
import HeroSlide from '../models/HeroSlide.js';
import HeroSettings from '../models/HeroSettings.js';
import { protect } from '../middleware/auth.js';
import { isAdministrator } from '../middleware/roleCheck.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// @route   GET /api/hero-slides
// @desc    Get all hero slides
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { isActive } = req.query;

    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const slides = await HeroSlide.find(filter)
      .populate('createdBy', 'name')
      .sort({ displayOrder: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: slides.length,
      data: { slides },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/hero-slides/active
// @desc    Get only active hero slides (for public - max 5)
// @access  Public
router.get('/active', async (req, res) => {
  try {
    const slides = await HeroSlide.find({ isActive: true })
      .select('-createdBy')
      .sort({ displayOrder: 1 })
      .limit(5);

    res.status(200).json({
      success: true,
      count: slides.length,
      data: { slides },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/hero-slides/:id
// @desc    Get single hero slide by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Hero slide not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { slide },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/hero-slides
// @desc    Create new hero slide
// @access  Protected + Admin
router.post('/', protect, isAdministrator, async (req, res) => {
  try {
    const {
      title,
      subtitle,
      backgroundImage,
      primaryButtonText,
      primaryButtonLink,
      secondaryButtonText,
      secondaryButtonLink,
      isActive,
      displayOrder
    } = req.body;

    if (!title || !backgroundImage) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and background image',
      });
    }

    const slideData = {
      title,
      subtitle: subtitle || '',
      backgroundImage,
      primaryButtonText: primaryButtonText || 'BAGIKAN CERITAMU',
      primaryButtonLink: primaryButtonLink || '#',
      secondaryButtonText: secondaryButtonText || 'LIHAT LEBIH LANJUT',
      secondaryButtonLink: secondaryButtonLink || '#',
      isActive: isActive === 'true' || isActive === true || false,
      displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      createdBy: req.user.id,
    };

    const slide = await HeroSlide.create(slideData);

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'create',
      resource: 'heroSlide',
      resourceId: slide._id,
      details: {
        title: slide.title,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      success: true,
      message: 'Hero slide created successfully',
      data: { slide },
    });
  } catch (error) {
    console.error('Hero slide creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/hero-slides/:id
// @desc    Update hero slide
// @access  Protected + Admin
router.put('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Hero slide not found',
      });
    }

    const {
      title,
      subtitle,
      backgroundImage,
      primaryButtonText,
      primaryButtonLink,
      secondaryButtonText,
      secondaryButtonLink,
      isActive,
      displayOrder
    } = req.body;

    slide.title = title || slide.title;
    slide.subtitle = subtitle !== undefined ? subtitle : slide.subtitle;
    slide.backgroundImage = backgroundImage || slide.backgroundImage;
    slide.primaryButtonText = primaryButtonText || slide.primaryButtonText;
    slide.primaryButtonLink = primaryButtonLink || slide.primaryButtonLink;
    slide.secondaryButtonText = secondaryButtonText || slide.secondaryButtonText;
    slide.secondaryButtonLink = secondaryButtonLink || slide.secondaryButtonLink;
    slide.isActive = isActive !== undefined ? (isActive === 'true' || isActive === true) : slide.isActive;
    slide.displayOrder = displayOrder !== undefined ? parseInt(displayOrder) : slide.displayOrder;

    await slide.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'heroSlide',
      resourceId: slide._id,
      details: {
        updatedFields: Object.keys(req.body),
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Hero slide updated successfully',
      data: { slide },
    });
  } catch (error) {
    console.error('Hero slide update error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/hero-slides/:id
// @desc    Delete hero slide
// @access  Protected + Admin
router.delete('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Hero slide not found',
      });
    }

    await slide.deleteOne();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'delete',
      resource: 'heroSlide',
      resourceId: slide._id,
      details: {
        title: slide.title,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Hero slide deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PATCH /api/hero-slides/:id/toggle-active
// @desc    Toggle hero slide active status
// @access  Protected + Admin
router.patch('/:id/toggle-active', protect, isAdministrator, async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Hero slide not found',
      });
    }

    slide.isActive = !slide.isActive;
    await slide.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'heroSlide',
      resourceId: slide._id,
      details: {
        field: 'isActive',
        newValue: slide.isActive,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: `Hero slide ${slide.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { slide },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==================== HERO SETTINGS ROUTES ====================

// @route   GET /api/hero-slides/settings
// @desc    Get hero slide settings
// @access  Public
router.get('/settings/config', async (req, res) => {
  try {
    const settings = await HeroSettings.getSettings();
    res.status(200).json({
      success: true,
      data: { settings },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/hero-slides/settings
// @desc    Update hero slide settings
// @access  Protected + Admin
router.put('/settings/config', protect, isAdministrator, async (req, res) => {
  try {
    const { slideDuration, autoPlay, showIndicators } = req.body;

    let settings = await HeroSettings.findOne();
    if (!settings) {
      settings = new HeroSettings();
    }

    if (slideDuration !== undefined) {
      settings.slideDuration = parseInt(slideDuration);
    }
    if (autoPlay !== undefined) {
      settings.autoPlay = autoPlay === true || autoPlay === 'true';
    }
    if (showIndicators !== undefined) {
      settings.showIndicators = showIndicators === true || showIndicators === 'true';
    }

    await settings.save();

    res.status(200).json({
      success: true,
      message: 'Hero settings updated successfully',
      data: { settings },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
