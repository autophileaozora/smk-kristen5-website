import express from 'express';
import Partner from '../models/Partner.js';
import { protect } from '../middleware/auth.js';
import { isAdministrator } from '../middleware/roleCheck.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// @route   GET /api/partners
// @desc    Get all partners
// @access  Public
router.get('/', async (req, res) => {
  try {
    const partners = await Partner.find()
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { partners },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/partners/active
// @desc    Get only active partners
// @access  Public
router.get('/active', async (req, res) => {
  try {
    const partners = await Partner.find({ isActive: true })
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: { partners },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/partners/:id
// @desc    Get single partner
// @access  Protected
router.get('/:id', protect, async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { partner },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/partners
// @desc    Create new partner
// @access  Protected + Admin
router.post('/', protect, isAdministrator, async (req, res) => {
  try {
    const { name, logo, startYear, endYear, location, description, order, isActive } = req.body;

    if (!name || !logo || !startYear || !location) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, logo, start year, and location',
      });
    }

    const partner = await Partner.create({
      name,
      logo,
      startYear,
      endYear: endYear || null,
      location,
      description: description || '',
      order: order || 1,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user.id,
    });

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'create',
      resource: 'partner',
      resourceId: partner._id,
      details: {
        name: partner.name,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      success: true,
      message: 'Partner created successfully',
      data: { partner },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/partners/:id
// @desc    Update partner
// @access  Protected + Admin
router.put('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found',
      });
    }

    const { name, logo, startYear, endYear, location, description, order, isActive } = req.body;

    partner.name = name || partner.name;
    partner.logo = logo || partner.logo;
    partner.startYear = startYear !== undefined ? startYear : partner.startYear;
    partner.endYear = endYear !== undefined ? endYear : partner.endYear;
    partner.location = location || partner.location;
    partner.description = description !== undefined ? description : partner.description;
    partner.order = order !== undefined ? order : partner.order;
    partner.isActive = isActive !== undefined ? isActive : partner.isActive;

    await partner.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'partner',
      resourceId: partner._id,
      details: {
        updatedFields: Object.keys(req.body),
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Partner updated successfully',
      data: { partner },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/partners/:id
// @desc    Delete partner
// @access  Protected + Admin
router.delete('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const partner = await Partner.findById(req.params.id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found',
      });
    }

    await partner.deleteOne();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'delete',
      resource: 'partner',
      resourceId: req.params.id,
      details: {
        name: partner.name,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Partner deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
