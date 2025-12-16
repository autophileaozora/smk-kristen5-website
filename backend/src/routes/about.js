import express from 'express';
import About from '../models/About.js';
import { protect } from '../middleware/auth.js';
import { isAdministrator } from '../middleware/roleCheck.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// @route   GET /api/about
// @desc    Get all about sections
// @access  Protected + Admin
router.get('/', protect, isAdministrator, async (req, res) => {
  try {
    const aboutSections = await About.find()
      .populate('updatedBy', 'name email')
      .sort({ section: 1 });

    res.status(200).json({
      success: true,
      data: { aboutSections },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/about/:section
// @desc    Get single about section (public)
// @access  Public
router.get('/:section', async (req, res) => {
  try {
    const { section } = req.params;

    if (!['sejarah', 'visi-misi', 'sambutan'].includes(section)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid section. Must be: sejarah, visi-misi, or sambutan',
      });
    }

    const about = await About.findOne({ section, isActive: true });

    if (!about) {
      return res.status(404).json({
        success: false,
        message: 'About section not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { about },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/about
// @desc    Create or update about section
// @access  Protected + Admin
router.post('/', protect, isAdministrator, async (req, res) => {
  try {
    const { section, title, content, image, authorName, authorTitle, authorPhoto, isActive } = req.body;

    if (!section || !title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide section, title, and content',
      });
    }

    if (!['sejarah', 'visi-misi', 'sambutan'].includes(section)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid section. Must be: sejarah, visi-misi, or sambutan',
      });
    }

    // Check if section already exists
    const existingAbout = await About.findOne({ section });

    let about;
    let action = 'create';

    if (existingAbout) {
      // Update existing
      existingAbout.title = title;
      existingAbout.content = content;
      existingAbout.image = image !== undefined ? image : existingAbout.image;
      existingAbout.authorName = authorName || existingAbout.authorName;
      existingAbout.authorTitle = authorTitle || existingAbout.authorTitle;
      existingAbout.authorPhoto = authorPhoto !== undefined ? authorPhoto : existingAbout.authorPhoto;
      existingAbout.isActive = isActive !== undefined ? isActive : existingAbout.isActive;
      existingAbout.updatedBy = req.user.id;

      about = await existingAbout.save();
      action = 'update';
    } else {
      // Create new
      about = await About.create({
        section,
        title,
        content,
        image: image || null,
        authorName: authorName || '',
        authorTitle: authorTitle || '',
        authorPhoto: authorPhoto || null,
        isActive: isActive !== undefined ? isActive : true,
        updatedBy: req.user.id,
      });
    }

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action,
      resource: 'about',
      resourceId: about._id,
      details: {
        section: about.section,
        title: about.title,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(action === 'create' ? 201 : 200).json({
      success: true,
      message: `About section ${action === 'create' ? 'created' : 'updated'} successfully`,
      data: { about },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/about/:section
// @desc    Delete about section
// @access  Protected + Admin
router.delete('/:section', protect, isAdministrator, async (req, res) => {
  try {
    const { section } = req.params;

    const about = await About.findOne({ section });

    if (!about) {
      return res.status(404).json({
        success: false,
        message: 'About section not found',
      });
    }

    await about.deleteOne();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'delete',
      resource: 'about',
      resourceId: about._id,
      details: {
        section: about.section,
        title: about.title,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'About section deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
