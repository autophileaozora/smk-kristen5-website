import express from 'express';
import NavbarItem from '../models/NavbarItem.js';
import { protect } from '../middleware/auth.js';
import { isAdministrator } from '../middleware/roleCheck.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// @route   GET /api/navbar
// @desc    Get navbar menu tree (for frontend)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const menuTree = await NavbarItem.getMenuTree();

    res.status(200).json({
      success: true,
      data: { menu: menuTree },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/navbar/all
// @desc    Get all navbar items (flat list for admin)
// @access  Protected
router.get('/all', protect, async (req, res) => {
  try {
    const items = await NavbarItem.getAllItems();

    res.status(200).json({
      success: true,
      data: { items },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/navbar/parents
// @desc    Get only top-level items (for dropdown parent selection)
// @access  Protected
router.get('/parents', protect, async (req, res) => {
  try {
    const parents = await NavbarItem.find({ parent: null })
      .select('_id label order')
      .sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: { parents },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/navbar/:id
// @desc    Get single navbar item
// @access  Protected
router.get('/:id', protect, async (req, res) => {
  try {
    const item = await NavbarItem.findById(req.params.id).populate(
      'parent',
      'label'
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Navbar item not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { item },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/navbar
// @desc    Create navbar item
// @access  Protected + Admin
router.post('/', protect, isAdministrator, async (req, res) => {
  try {
    const {
      label,
      url,
      parent,
      order,
      isDropdown,
      target,
      icon,
      isActive,
      isButton,
      buttonVariant,
    } = req.body;

    if (!label) {
      return res.status(400).json({
        success: false,
        message: 'Label is required',
      });
    }

    // Get max order for the same parent level
    const maxOrderItem = await NavbarItem.findOne({ parent: parent || null })
      .sort({ order: -1 })
      .select('order');

    const newOrder = order !== undefined ? order : (maxOrderItem?.order || 0) + 1;

    const item = await NavbarItem.create({
      label,
      url: url || '#',
      parent: parent || null,
      order: newOrder,
      isDropdown: isDropdown || false,
      target: target || '_self',
      icon: icon || '',
      isActive: isActive !== undefined ? isActive : true,
      isButton: isButton || false,
      buttonVariant: buttonVariant || 'primary',
      createdBy: req.user.id,
    });

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'create',
      resource: 'navbarItem',
      resourceId: item._id,
      details: { label: item.label },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      success: true,
      message: 'Navbar item created successfully',
      data: { item },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/navbar/reorder
// @desc    Reorder navbar items
// @access  Protected + Admin
// NOTE: This route MUST be before /:id to prevent "reorder" being parsed as ObjectId
router.put('/reorder/bulk', protect, isAdministrator, async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, order, parent }

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Items array is required',
      });
    }

    // Update each item's order and parent
    const updatePromises = items.map((item) =>
      NavbarItem.findByIdAndUpdate(item.id, {
        order: item.order,
        parent: item.parent || null,
      })
    );

    await Promise.all(updatePromises);

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'navbarItem',
      resourceId: null,
      details: { action: 'bulk_reorder', itemCount: items.length },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Navbar items reordered successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/navbar/:id
// @desc    Update navbar item
// @access  Protected + Admin
router.put('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const item = await NavbarItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Navbar item not found',
      });
    }

    const {
      label,
      url,
      parent,
      order,
      isDropdown,
      target,
      icon,
      isActive,
      isButton,
      buttonVariant,
    } = req.body;

    // Prevent setting self as parent
    if (parent && parent.toString() === item._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Item cannot be its own parent',
      });
    }

    if (label !== undefined) item.label = label;
    if (url !== undefined) item.url = url;
    if (parent !== undefined) item.parent = parent || null;
    if (order !== undefined) item.order = order;
    if (isDropdown !== undefined) item.isDropdown = isDropdown;
    if (target !== undefined) item.target = target;
    if (icon !== undefined) item.icon = icon;
    if (isActive !== undefined) item.isActive = isActive;
    if (isButton !== undefined) item.isButton = isButton;
    if (buttonVariant !== undefined) item.buttonVariant = buttonVariant;

    await item.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'navbarItem',
      resourceId: item._id,
      details: { updatedFields: Object.keys(req.body) },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Navbar item updated successfully',
      data: { item },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/navbar/all
// @desc    Delete all navbar items
// @access  Protected + Admin
// NOTE: This route MUST be before /:id to prevent "all" being parsed as ObjectId
router.delete('/all', protect, isAdministrator, async (req, res) => {
  try {
    const result = await NavbarItem.deleteMany({});

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'delete',
      resource: 'navbarItem',
      resourceId: null,
      details: { action: 'delete_all', deletedCount: result.deletedCount },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} menu items deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/navbar/:id
// @desc    Delete navbar item
// @access  Protected + Admin
router.delete('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const item = await NavbarItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Navbar item not found',
      });
    }

    // Also delete all children if this is a dropdown
    if (item.isDropdown) {
      await NavbarItem.deleteMany({ parent: item._id });
    }

    await item.deleteOne();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'delete',
      resource: 'navbarItem',
      resourceId: req.params.id,
      details: { label: item.label },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Navbar item deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/navbar/seed
// @desc    Seed default navbar items
// @access  Protected + Admin
router.post('/seed', protect, isAdministrator, async (req, res) => {
  try {
    // Check if navbar already has items
    const existingCount = await NavbarItem.countDocuments();
    if (existingCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Navbar already has items. Delete all items first to re-seed.',
      });
    }

    // Default navbar structure matching SMK Kristen 5 Klaten website
    const defaultItems = [
      { label: 'Beranda', url: '/', order: 1 },
      { label: 'Profil', url: '#', order: 2, isDropdown: true },
      { label: 'Jurusan', url: '/jurusan', order: 3, isDropdown: true },
      { label: 'Kegiatan', url: '/kegiatan', order: 4 },
      { label: 'BKK / Karier', url: '/bkk', order: 5 },
      { label: 'Berita', url: '/artikel', order: 6 },
      { label: 'Kontak', url: '/kontak', order: 7 },
      {
        label: 'PENDAFTARAN',
        url: '/pendaftaran',
        order: 8,
        isButton: true,
        buttonVariant: 'primary',
      },
    ];

    const createdItems = await NavbarItem.insertMany(
      defaultItems.map((item) => ({
        ...item,
        createdBy: req.user.id,
      }))
    );

    // Add Profil dropdown children
    const profilParent = createdItems.find((i) => i.label === 'Profil');
    if (profilParent) {
      const profilChildren = [
        { label: 'Sejarah', url: '/sejarah', parent: profilParent._id, order: 1 },
        { label: 'Visi & Misi', url: '/visi-misi', parent: profilParent._id, order: 2 },
        { label: 'Sambutan Kepala Sekolah', url: '/sambutan', parent: profilParent._id, order: 3 },
        { label: 'Tentang Kami', url: '/tentang', parent: profilParent._id, order: 4 },
      ];

      await NavbarItem.insertMany(
        profilChildren.map((item) => ({
          ...item,
          createdBy: req.user.id,
        }))
      );
    }

    // Add Jurusan dropdown children
    const jurusanParent = createdItems.find((i) => i.label === 'Jurusan');
    if (jurusanParent) {
      const jurusanChildren = [
        { label: 'TKJ', url: '/jurusan/tkj', parent: jurusanParent._id, order: 1 },
        { label: 'TKRO', url: '/jurusan/tkro', parent: jurusanParent._id, order: 2 },
        { label: 'AKL', url: '/jurusan/akl', parent: jurusanParent._id, order: 3 },
        { label: 'BDP', url: '/jurusan/bdp', parent: jurusanParent._id, order: 4 },
      ];

      await NavbarItem.insertMany(
        jurusanChildren.map((item) => ({
          ...item,
          createdBy: req.user.id,
        }))
      );
    }

    res.status(201).json({
      success: true,
      message: 'Default navbar items created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
