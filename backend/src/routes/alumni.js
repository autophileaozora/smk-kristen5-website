import express from 'express';
import Alumni from '../models/Alumni.js';
import { protect } from '../middleware/auth.js';
import { isAdministrator } from '../middleware/roleCheck.js';
import { uploadSingle, uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// @route   GET /api/alumni
// @desc    Get all alumni
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { graduationYear, jurusan, isPublished, isFeatured } = req.query;
    
    const filter = {};
    if (graduationYear) filter.graduationYear = parseInt(graduationYear);
    if (jurusan) filter.jurusan = jurusan;
    if (isPublished !== undefined) filter.isPublished = isPublished === 'true';
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';

    const alumni = await Alumni.find(filter)
      .populate('createdBy', 'name')
      .sort({ graduationYear: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: alumni.length,
      data: { alumni },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/alumni/published
// @desc    Get only published alumni (for public)
// @access  Public
router.get('/published', async (req, res) => {
  try {
    const { graduationYear, jurusan, isFeatured } = req.query;
    
    const filter = { isPublished: true };
    if (graduationYear) filter.graduationYear = parseInt(graduationYear);
    if (jurusan) filter.jurusan = jurusan;
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';

    const alumni = await Alumni.find(filter)
      .select('-createdBy')
      .sort({ graduationYear: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: alumni.length,
      data: { alumni },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/alumni/featured
// @desc    Get featured alumni (for public homepage)
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const alumni = await Alumni.find({ isPublished: true, isFeatured: true })
      .select('-createdBy')
      .sort({ graduationYear: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      count: alumni.length,
      data: { alumni },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/alumni/years
// @desc    Get list of available graduation years
// @access  Public
router.get('/years', async (req, res) => {
  try {
    const years = await Alumni.distinct('graduationYear');
    const sortedYears = years.sort((a, b) => b - a);

    res.status(200).json({
      success: true,
      data: { years: sortedYears },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/alumni/:id
// @desc    Get single alumni by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: 'Alumni not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { alumni },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/alumni
// @desc    Create new alumni
// @access  Protected + Admin
router.post('/', protect, isAdministrator, uploadSingle('photo'), async (req, res) => {
  try {
    const {
      name,
      graduationYear,
      jurusan,
      currentOccupation,
      company,
      university,
      achievement,
      testimonial,
      linkedIn,
      isPublished,
      isFeatured,
    } = req.body;

    if (!name || !graduationYear || !jurusan) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, graduation year, and jurusan',
      });
    }

    const alumniData = {
      name,
      graduationYear: parseInt(graduationYear),
      jurusan,
      currentOccupation: currentOccupation || '',
      company: company || '',
      university: university || '',
      achievement: achievement || '',
      testimonial: testimonial || '',
      linkedIn: linkedIn || '',
      isPublished: isPublished === 'true' || isPublished === true,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      createdBy: req.user.id,
    };

    // Upload photo to Cloudinary if provided
    if (req.file) {
      try {
        console.log('Uploading alumni photo to Cloudinary...');
        const result = await uploadToCloudinary(req.file.buffer);
        console.log('Cloudinary upload success:', result.secure_url);
        alumniData.photo = result.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        const errorMessage = uploadError?.message || uploadError?.error?.message || JSON.stringify(uploadError) || 'Unknown error';
        return res.status(500).json({
          success: false,
          message: 'Failed to upload photo to Cloudinary: ' + errorMessage,
        });
      }
    }

    const alumni = await Alumni.create(alumniData);

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'create',
      resource: 'alumni',
      resourceId: alumni._id,
      details: {
        name: alumni.name,
        graduationYear: alumni.graduationYear,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      success: true,
      message: 'Alumni created successfully',
      data: { alumni },
    });
  } catch (error) {
    console.error('Alumni creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/alumni/:id
// @desc    Update alumni
// @access  Protected + Admin
router.put('/:id', protect, isAdministrator, uploadSingle('photo'), async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.params.id);

    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: 'Alumni not found',
      });
    }

    const {
      name,
      graduationYear,
      jurusan,
      currentOccupation,
      company,
      university,
      achievement,
      testimonial,
      linkedIn,
      isPublished,
      isFeatured,
    } = req.body;

    alumni.name = name || alumni.name;
    alumni.graduationYear = graduationYear ? parseInt(graduationYear) : alumni.graduationYear;
    alumni.jurusan = jurusan || alumni.jurusan;
    alumni.currentOccupation = currentOccupation !== undefined ? currentOccupation : alumni.currentOccupation;
    alumni.company = company !== undefined ? company : alumni.company;
    alumni.university = university !== undefined ? university : alumni.university;
    alumni.achievement = achievement !== undefined ? achievement : alumni.achievement;
    alumni.testimonial = testimonial !== undefined ? testimonial : alumni.testimonial;
    alumni.linkedIn = linkedIn !== undefined ? linkedIn : alumni.linkedIn;
    alumni.isPublished = isPublished !== undefined ? (isPublished === 'true' || isPublished === true) : alumni.isPublished;
    alumni.isFeatured = isFeatured !== undefined ? (isFeatured === 'true' || isFeatured === true) : alumni.isFeatured;

    // Upload new photo to Cloudinary if provided
    if (req.file) {
      try {
        console.log('Uploading alumni photo to Cloudinary...');
        const result = await uploadToCloudinary(req.file.buffer);
        console.log('Cloudinary upload success:', result.secure_url);
        alumni.photo = result.secure_url;
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        const errorMessage = uploadError?.message || uploadError?.error?.message || JSON.stringify(uploadError) || 'Unknown error';
        return res.status(500).json({
          success: false,
          message: 'Failed to upload photo to Cloudinary: ' + errorMessage,
        });
      }
    }

    await alumni.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'alumni',
      resourceId: alumni._id,
      details: {
        updatedFields: Object.keys(req.body),
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Alumni updated successfully',
      data: { alumni },
    });
  } catch (error) {
    console.error('Alumni update error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/alumni/:id
// @desc    Delete alumni
// @access  Protected + Admin
router.delete('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.params.id);

    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: 'Alumni not found',
      });
    }

    await alumni.deleteOne();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'delete',
      resource: 'alumni',
      resourceId: alumni._id,
      details: {
        name: alumni.name,
        graduationYear: alumni.graduationYear,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Alumni deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PATCH /api/alumni/:id/toggle-published
// @desc    Toggle alumni published status
// @access  Protected + Admin
router.patch('/:id/toggle-published', protect, isAdministrator, async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.params.id);

    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: 'Alumni not found',
      });
    }

    alumni.isPublished = !alumni.isPublished;
    await alumni.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'alumni',
      resourceId: alumni._id,
      details: {
        field: 'isPublished',
        newValue: alumni.isPublished,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: `Alumni ${alumni.isPublished ? 'published' : 'unpublished'} successfully`,
      data: { alumni },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PATCH /api/alumni/:id/toggle-featured
// @desc    Toggle alumni featured status
// @access  Protected + Admin
router.patch('/:id/toggle-featured', protect, isAdministrator, async (req, res) => {
  try {
    const alumni = await Alumni.findById(req.params.id);

    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: 'Alumni not found',
      });
    }

    alumni.isFeatured = !alumni.isFeatured;
    await alumni.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'alumni',
      resourceId: alumni._id,
      details: {
        field: 'isFeatured',
        newValue: alumni.isFeatured,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: `Alumni ${alumni.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      data: { alumni },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
