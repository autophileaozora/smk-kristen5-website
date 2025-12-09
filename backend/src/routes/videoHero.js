import express from 'express';
import VideoHero from '../models/VideoHero.js';
import { protect } from '../middleware/auth.js';
import { isAdministrator } from '../middleware/roleCheck.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// @route   GET /api/video-hero
// @desc    Get all video heroes
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { isActive } = req.query;
    
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const videos = await VideoHero.find(filter)
      .populate('createdBy', 'name')
      .sort({ displayOrder: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: videos.length,
      data: { videos },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/video-hero/active
// @desc    Get only active video heroes (for public - max 3)
// @access  Public
router.get('/active', async (req, res) => {
  try {
    const videos = await VideoHero.find({ isActive: true })
      .select('-createdBy')
      .sort({ displayOrder: 1 })
      .limit(3);

    res.status(200).json({
      success: true,
      count: videos.length,
      data: { videos },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/video-hero/:id
// @desc    Get single video hero by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const video = await VideoHero.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video hero not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { video },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/video-hero
// @desc    Create new video hero
// @access  Protected + Admin
router.post('/', protect, isAdministrator, async (req, res) => {
  try {
    const { title, youtubeUrl, description, isActive, displayOrder } = req.body;

    if (!title || !youtubeUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and YouTube URL',
      });
    }

    const videoData = {
      title,
      youtubeUrl,
      description: description || '',
      isActive: isActive === 'true' || isActive === true || false,
      displayOrder: displayOrder ? parseInt(displayOrder) : 0,
      createdBy: req.user.id,
    };

    const video = await VideoHero.create(videoData);

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'create',
      resource: 'videoHero',
      resourceId: video._id,
      details: {
        title: video.title,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      success: true,
      message: 'Video hero created successfully',
      data: { video },
    });
  } catch (error) {
    console.error('Video hero creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/video-hero/:id
// @desc    Update video hero
// @access  Protected + Admin
router.put('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const video = await VideoHero.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video hero not found',
      });
    }

    const { title, youtubeUrl, description, isActive, displayOrder } = req.body;

    video.title = title || video.title;
    video.youtubeUrl = youtubeUrl || video.youtubeUrl;
    video.description = description !== undefined ? description : video.description;
    video.isActive = isActive !== undefined ? (isActive === 'true' || isActive === true) : video.isActive;
    video.displayOrder = displayOrder !== undefined ? parseInt(displayOrder) : video.displayOrder;

    await video.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'videoHero',
      resourceId: video._id,
      details: {
        updatedFields: Object.keys(req.body),
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Video hero updated successfully',
      data: { video },
    });
  } catch (error) {
    console.error('Video hero update error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/video-hero/:id
// @desc    Delete video hero
// @access  Protected + Admin
router.delete('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const video = await VideoHero.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video hero not found',
      });
    }

    await video.deleteOne();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'delete',
      resource: 'videoHero',
      resourceId: video._id,
      details: {
        title: video.title,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Video hero deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PATCH /api/video-hero/:id/toggle-active
// @desc    Toggle video hero active status
// @access  Protected + Admin
router.patch('/:id/toggle-active', protect, isAdministrator, async (req, res) => {
  try {
    const video = await VideoHero.findById(req.params.id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video hero not found',
      });
    }

    video.isActive = !video.isActive;
    await video.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'videoHero',
      resourceId: video._id,
      details: {
        field: 'isActive',
        newValue: video.isActive,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: `Video hero ${video.isActive ? 'activated' : 'deactivated'} successfully`,
      data: { video },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
