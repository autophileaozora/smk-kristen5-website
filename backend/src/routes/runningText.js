import express from 'express';
import RunningText from '../models/RunningText.js';
import { protect } from '../middleware/auth.js';
import { isAdministrator } from '../middleware/roleCheck.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// @route   GET /api/running-text
// @desc    Get all running texts
// @access  Public (for display) / Protected (for admin panel)
router.get('/', async (req, res) => {
  try {
    const runningTexts = await RunningText.find()
      .sort({ order: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      data: { runningTexts },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/running-text/active
// @desc    Get only active running texts
// @access  Public
router.get('/active', async (req, res) => {
  try {
    const runningTexts = await RunningText.find({ isActive: true })
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: { runningTexts },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/running-text/:id
// @desc    Get single running text
// @access  Protected
router.get('/:id', protect, async (req, res) => {
  try {
    const runningText = await RunningText.findById(req.params.id);

    if (!runningText) {
      return res.status(404).json({
        success: false,
        message: 'Running text not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { runningText },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/running-text
// @desc    Create new running text
// @access  Protected + Admin
router.post('/', protect, isAdministrator, async (req, res) => {
  try {
    const { text, link, order, isActive } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Please provide text',
      });
    }

    const runningText = await RunningText.create({
      text,
      link,
      order: order || 1,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user.id,
    });

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'create',
      resource: 'runningText',
      resourceId: runningText._id,
      details: {
        text: runningText.text,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      success: true,
      message: 'Running text created successfully',
      data: { runningText },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/running-text/:id
// @desc    Update running text
// @access  Protected + Admin
router.put('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const runningText = await RunningText.findById(req.params.id);

    if (!runningText) {
      return res.status(404).json({
        success: false,
        message: 'Running text not found',
      });
    }

    const { text, link, order, isActive } = req.body;

    runningText.text = text || runningText.text;
    runningText.link = link !== undefined ? link : runningText.link;
    runningText.order = order || runningText.order;
    runningText.isActive = isActive !== undefined ? isActive : runningText.isActive;

    await runningText.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'runningText',
      resourceId: runningText._id,
      details: {
        updatedFields: Object.keys(req.body),
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Running text updated successfully',
      data: { runningText },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/running-text/:id
// @desc    Delete running text
// @access  Protected + Admin
router.delete('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const runningText = await RunningText.findById(req.params.id);

    if (!runningText) {
      return res.status(404).json({
        success: false,
        message: 'Running text not found',
      });
    }

    await runningText.deleteOne();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'delete',
      resource: 'runningText',
      resourceId: req.params.id,
      details: {
        text: runningText.text,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Running text deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
