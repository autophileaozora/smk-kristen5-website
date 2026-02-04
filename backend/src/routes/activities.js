import express from 'express';
import { ActivityTab, ActivitySettings } from '../models/Activity.js';
import { protect } from '../middleware/auth.js';
import { isAdministrator } from '../middleware/roleCheck.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// ==================== PUBLIC ROUTES ====================

// @route   GET /api/activities/tabs
// @desc    Get all active activity tabs with items
// @access  Public
router.get('/tabs', async (req, res) => {
  try {
    const tabs = await ActivityTab.find({ isActive: true })
      .sort({ order: 1 })
      .select('-createdBy -createdAt -updatedAt -__v');

    res.status(200).json({
      success: true,
      data: { tabs },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/activities/settings
// @desc    Get activity section settings
// @access  Public
router.get('/settings', async (req, res) => {
  try {
    let settings = await ActivitySettings.findOne();

    // Create default settings if none exist
    if (!settings) {
      settings = {
        globalLink: '/kegiatan',
        globalButtonText: 'Explore Kegiatan Siswa',
        sectionTitle: 'Pembelajaran & Kegiatan',
        sectionSubtitle: 'Berbagai aktivitas pembelajaran dan kegiatan siswa',
      };
    }

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

// ==================== ADMIN ROUTES ====================

// @route   GET /api/activities/tabs/all
// @desc    Get all activity tabs (including inactive) for admin
// @access  Protected + Admin
router.get('/tabs/all', protect, isAdministrator, async (req, res) => {
  try {
    const tabs = await ActivityTab.find()
      .populate('createdBy', 'name')
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: { tabs },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/activities/tabs/:id
// @desc    Get single tab by ID
// @access  Protected + Admin
router.get('/tabs/:id', protect, isAdministrator, async (req, res) => {
  try {
    const tab = await ActivityTab.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!tab) {
      return res.status(404).json({
        success: false,
        message: 'Tab not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { tab },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/activities/tabs
// @desc    Create new activity tab
// @access  Protected + Admin
router.post('/tabs', protect, isAdministrator, async (req, res) => {
  try {
    const { name, order, isActive } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Tab name is required',
      });
    }

    // Generate unique slug
    let baseSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    let slug = baseSlug;
    let counter = 1;

    // Check for existing slug and make it unique
    while (await ActivityTab.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const tab = await ActivityTab.create({
      name,
      slug,
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      items: [],
      createdBy: req.user.id,
    });

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'create',
      resource: 'activity_tab',
      resourceId: tab._id,
      details: { name: tab.name },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      success: true,
      message: 'Activity tab created successfully',
      data: { tab },
    });
  } catch (error) {
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Tab dengan nama serupa sudah ada',
      });
    }
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/activities/tabs/:id
// @desc    Update activity tab
// @access  Protected + Admin
router.put('/tabs/:id', protect, isAdministrator, async (req, res) => {
  try {
    const tab = await ActivityTab.findById(req.params.id);

    if (!tab) {
      return res.status(404).json({
        success: false,
        message: 'Tab not found',
      });
    }

    const { name, order, isActive } = req.body;

    if (name !== undefined) tab.name = name;
    if (order !== undefined) tab.order = order;
    if (isActive !== undefined) tab.isActive = isActive;

    await tab.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'activity_tab',
      resourceId: tab._id,
      details: { updatedFields: Object.keys(req.body) },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Activity tab updated successfully',
      data: { tab },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/activities/tabs/:id
// @desc    Delete activity tab
// @access  Protected + Admin
router.delete('/tabs/:id', protect, isAdministrator, async (req, res) => {
  try {
    const tab = await ActivityTab.findById(req.params.id);

    if (!tab) {
      return res.status(404).json({
        success: false,
        message: 'Tab not found',
      });
    }

    await tab.deleteOne();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'delete',
      resource: 'activity_tab',
      resourceId: req.params.id,
      details: { name: tab.name },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Activity tab deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==================== TAB ITEMS ROUTES ====================

// @route   POST /api/activities/tabs/:id/items
// @desc    Add item to activity tab
// @access  Protected + Admin
router.post('/tabs/:id/items', protect, isAdministrator, async (req, res) => {
  try {
    const tab = await ActivityTab.findById(req.params.id);

    if (!tab) {
      return res.status(404).json({
        success: false,
        message: 'Tab not found',
      });
    }

    const { title, description, order, image } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Item title is required',
      });
    }

    if (!image) {
      return res.status(400).json({
        success: false,
        message: 'Image is required',
      });
    }

    const newItem = {
      image,
      title,
      description: description || '',
      order: order || tab.items.length,
    };

    tab.items.push(newItem);
    await tab.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'create',
      resource: 'activity_item',
      resourceId: tab._id,
      details: { tabName: tab.name, itemTitle: title },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      success: true,
      message: 'Item added successfully',
      data: { tab },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/activities/tabs/:tabId/items/:itemId
// @desc    Update item in activity tab
// @access  Protected + Admin
router.put('/tabs/:tabId/items/:itemId', protect, isAdministrator, async (req, res) => {
  try {
    const tab = await ActivityTab.findById(req.params.tabId);

    if (!tab) {
      return res.status(404).json({
        success: false,
        message: 'Tab not found',
      });
    }

    const itemIndex = tab.items.findIndex(item => item._id.toString() === req.params.itemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    const { title, description, order, image } = req.body;

    if (title !== undefined) tab.items[itemIndex].title = title;
    if (description !== undefined) tab.items[itemIndex].description = description;
    if (order !== undefined) tab.items[itemIndex].order = order;
    if (image !== undefined) tab.items[itemIndex].image = image;

    await tab.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'activity_item',
      resourceId: tab._id,
      details: { tabName: tab.name, itemId: req.params.itemId },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: { tab },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/activities/tabs/:tabId/items/:itemId
// @desc    Delete item from activity tab
// @access  Protected + Admin
router.delete('/tabs/:tabId/items/:itemId', protect, isAdministrator, async (req, res) => {
  try {
    const tab = await ActivityTab.findById(req.params.tabId);

    if (!tab) {
      return res.status(404).json({
        success: false,
        message: 'Tab not found',
      });
    }

    const itemIndex = tab.items.findIndex(item => item._id.toString() === req.params.itemId);
    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
      });
    }

    const deletedItem = tab.items[itemIndex];
    tab.items.splice(itemIndex, 1);
    await tab.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'delete',
      resource: 'activity_item',
      resourceId: tab._id,
      details: { tabName: tab.name, itemTitle: deletedItem.title },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Item deleted successfully',
      data: { tab },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// ==================== SETTINGS ROUTES ====================

// @route   PUT /api/activities/settings
// @desc    Update activity section settings
// @access  Protected + Admin
router.put('/settings', protect, isAdministrator, async (req, res) => {
  try {
    const { globalLink, globalButtonText, sectionTitle, sectionSubtitle } = req.body;

    let settings = await ActivitySettings.findOne();

    if (!settings) {
      settings = new ActivitySettings({
        updatedBy: req.user.id,
      });
    }

    if (globalLink !== undefined) settings.globalLink = globalLink;
    if (globalButtonText !== undefined) settings.globalButtonText = globalButtonText;
    if (sectionTitle !== undefined) settings.sectionTitle = sectionTitle;
    if (sectionSubtitle !== undefined) settings.sectionSubtitle = sectionSubtitle;
    settings.updatedBy = req.user.id;

    await settings.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'activity_settings',
      resourceId: settings._id,
      details: { updatedFields: Object.keys(req.body) },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
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
