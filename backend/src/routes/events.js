import express from 'express';
import Event from '../models/Event.js';
import { protect } from '../middleware/auth.js';
import { isAdministrator } from '../middleware/roleCheck.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// @route   GET /api/events
// @desc    Get all active events (upcoming)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category, limit = 10 } = req.query;

    const query = { isActive: true };

    // Filter by category if provided
    if (category && category !== 'semua') {
      query.category = category;
    }

    const events = await Event.find(query)
      .sort({ eventDate: 1, order: 1 })
      .limit(parseInt(limit))
      .select('-createdBy -createdAt -updatedAt -__v');

    res.status(200).json({
      success: true,
      data: { events },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/events/upcoming
// @desc    Get upcoming events only (from today)
// @access  Public
router.get('/upcoming', async (req, res) => {
  try {
    const { category, limit = 6 } = req.query;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const query = {
      isActive: true,
      eventDate: { $gte: today }
    };

    if (category && category !== 'semua') {
      query.category = category;
    }

    const events = await Event.find(query)
      .sort({ eventDate: 1, order: 1 })
      .limit(parseInt(limit))
      .select('-createdBy -createdAt -updatedAt -__v');

    res.status(200).json({
      success: true,
      data: { events },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==================== ADMIN ROUTES ====================

// @route   GET /api/events/all
// @desc    Get all events (including inactive) for admin
// @access  Protected + Admin
router.get('/all', protect, isAdministrator, async (req, res) => {
  try {
    const events = await Event.find()
      .populate('createdBy', 'name')
      .sort({ eventDate: -1 });

    res.status(200).json({
      success: true,
      data: { events },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/events/:id
// @desc    Get single event by ID
// @access  Protected + Admin
router.get('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { event },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/events
// @desc    Create new event
// @access  Protected + Admin
router.post('/', protect, isAdministrator, async (req, res) => {
  try {
    const { title, description, category, eventDate, startTime, endTime, location, isActive, order } = req.body;

    if (!title || !eventDate) {
      return res.status(400).json({
        success: false,
        message: 'Title and event date are required',
      });
    }

    const event = await Event.create({
      title,
      description: description || '',
      category: category || 'akademik',
      eventDate: new Date(eventDate),
      startTime: startTime || '07:00',
      endTime: endTime || '12:00',
      location: location || '',
      isActive: isActive !== undefined ? isActive : true,
      order: order || 0,
      createdBy: req.user.id,
    });

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'create',
      resource: 'event',
      resourceId: event._id,
      details: { title: event.title },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/events/:id
// @desc    Update event
// @access  Protected + Admin
router.put('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    const { title, description, category, eventDate, startTime, endTime, location, isActive, order } = req.body;

    if (title !== undefined) event.title = title;
    if (description !== undefined) event.description = description;
    if (category !== undefined) event.category = category;
    if (eventDate !== undefined) event.eventDate = new Date(eventDate);
    if (startTime !== undefined) event.startTime = startTime;
    if (endTime !== undefined) event.endTime = endTime;
    if (location !== undefined) event.location = location;
    if (isActive !== undefined) event.isActive = isActive;
    if (order !== undefined) event.order = order;

    await event.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'event',
      resourceId: event._id,
      details: { updatedFields: Object.keys(req.body) },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Event updated successfully',
      data: { event },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/events/:id
// @desc    Delete event
// @access  Protected + Admin
router.delete('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found',
      });
    }

    await event.deleteOne();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'delete',
      resource: 'event',
      resourceId: req.params.id,
      details: { title: event.title },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
