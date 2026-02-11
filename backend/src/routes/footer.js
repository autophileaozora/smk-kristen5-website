import express from 'express';
import FooterColumn from '../models/FooterColumn.js';
import { protect } from '../middleware/auth.js';
import { isAdministrator } from '../middleware/roleCheck.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// @route   GET /api/footer
// @desc    Get footer data (for frontend)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const columns = await FooterColumn.getFooterData();

    res.status(200).json({
      success: true,
      data: { columns },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/footer/all
// @desc    Get all footer columns (for admin)
// @access  Protected
router.get('/all', protect, async (req, res) => {
  try {
    const columns = await FooterColumn.find().sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: { columns },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/footer/:id
// @desc    Get single footer column
// @access  Protected
router.get('/:id', protect, async (req, res) => {
  try {
    const column = await FooterColumn.findById(req.params.id);

    if (!column) {
      return res.status(404).json({
        success: false,
        message: 'Footer column not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { column },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/footer
// @desc    Create footer column
// @access  Protected + Admin
router.post('/', protect, isAdministrator, async (req, res) => {
  try {
    const { title, type, items, width, isActive, showTitle, showBullets, logoUrl, logoSize, description } =
      req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required',
      });
    }

    // Get max order
    const maxOrderCol = await FooterColumn.findOne().sort({ order: -1 }).select('order');
    const newOrder = (maxOrderCol?.order || 0) + 1;

    const column = await FooterColumn.create({
      title,
      type: type || 'links',
      items: items || [],
      order: newOrder,
      width: width || 'auto',
      isActive: isActive !== undefined ? isActive : true,
      showTitle: showTitle !== undefined ? showTitle : true,
      showBullets: showBullets !== undefined ? showBullets : true,
      logoUrl: logoUrl || '',
      logoSize: logoSize || 'medium',
      description: description || '',
      createdBy: req.user.id,
    });

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'create',
      resource: 'footerColumn',
      resourceId: column._id,
      details: { title: column.title },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      success: true,
      message: 'Footer column created successfully',
      data: { column },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/footer/reorder/bulk
// @desc    Reorder footer columns
// @access  Protected + Admin
// NOTE: This route MUST be before /:id
router.put('/reorder/bulk', protect, isAdministrator, async (req, res) => {
  try {
    const { columns } = req.body;

    if (!columns || !Array.isArray(columns)) {
      return res.status(400).json({
        success: false,
        message: 'Columns array is required',
      });
    }

    const updatePromises = columns.map((col) =>
      FooterColumn.findByIdAndUpdate(col.id, { order: col.order })
    );

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: 'Footer columns reordered successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/footer/:id
// @desc    Update footer column
// @access  Protected + Admin
router.put('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const column = await FooterColumn.findById(req.params.id);

    if (!column) {
      return res.status(404).json({
        success: false,
        message: 'Footer column not found',
      });
    }

    const { title, type, items, order, width, isActive, showTitle, showBullets, logoUrl, logoSize, description } =
      req.body;

    if (title !== undefined) column.title = title;
    if (type !== undefined) column.type = type;
    if (items !== undefined) column.items = items;
    if (order !== undefined) column.order = order;
    if (width !== undefined) column.width = width;
    if (isActive !== undefined) column.isActive = isActive;
    if (showTitle !== undefined) column.showTitle = showTitle;
    if (showBullets !== undefined) column.showBullets = showBullets;
    if (logoUrl !== undefined) column.logoUrl = logoUrl;
    if (logoSize !== undefined) column.logoSize = logoSize;
    if (description !== undefined) column.description = description;

    await column.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'footerColumn',
      resourceId: column._id,
      details: { updatedFields: Object.keys(req.body) },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Footer column updated successfully',
      data: { column },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/footer/all
// @desc    Delete all footer columns
// @access  Protected + Admin
// NOTE: This route MUST be before /:id
router.delete('/all', protect, isAdministrator, async (req, res) => {
  try {
    const result = await FooterColumn.deleteMany({});

    await AuditLog.create({
      user: req.user.id,
      action: 'delete',
      resource: 'footerColumn',
      resourceId: null,
      details: { action: 'delete_all', deletedCount: result.deletedCount },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: `${result.deletedCount} footer columns deleted successfully`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/footer/:id
// @desc    Delete footer column
// @access  Protected + Admin
router.delete('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const column = await FooterColumn.findById(req.params.id);

    if (!column) {
      return res.status(404).json({
        success: false,
        message: 'Footer column not found',
      });
    }

    await column.deleteOne();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'delete',
      resource: 'footerColumn',
      resourceId: req.params.id,
      details: { title: column.title },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Footer column deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/footer/seed
// @desc    Seed default footer columns
// @access  Protected + Admin
router.post('/seed', protect, isAdministrator, async (req, res) => {
  try {
    const existingCount = await FooterColumn.countDocuments();
    if (existingCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Footer already has columns. Delete all columns first to re-seed.',
      });
    }

    const defaultColumns = [
      {
        title: 'SMK KRISTEN 5 KLATEN',
        type: 'logo',
        order: 1,
        width: '3',
        showTitle: true,
        showBullets: false,
        description:
          'Jl. Opak, Metuk, Tegalyoso, Dusun 1, Tegalyoso, Kec. Klaten Sel., Kabupaten Klaten, Jawa Tengah 57424',
        items: [],
        createdBy: req.user.id,
      },
      {
        title: 'PROFIL',
        type: 'links',
        order: 2,
        width: '2',
        showTitle: true,
        showBullets: true,
        items: [
          { type: 'link', content: 'Sejarah', url: '/sejarah', order: 1 },
          { type: 'link', content: 'Visi & Misi', url: '/visi-misi', order: 2 },
          { type: 'link', content: 'Sambutan Kepala Sekolah', url: '/sambutan', order: 3 },
          { type: 'link', content: 'Tentang Kami', url: '/tentang', order: 4 },
        ],
        createdBy: req.user.id,
      },
      {
        title: 'JURUSAN',
        type: 'links',
        order: 3,
        width: '2',
        showTitle: true,
        showBullets: true,
        items: [
          { type: 'link', content: 'TKJ', url: '/jurusan/tkj', order: 1 },
          { type: 'link', content: 'TKRO', url: '/jurusan/tkro', order: 2 },
          { type: 'link', content: 'AKL', url: '/jurusan/akl', order: 3 },
          { type: 'link', content: 'BDP', url: '/jurusan/bdp', order: 4 },
        ],
        createdBy: req.user.id,
      },
      {
        title: 'MENU',
        type: 'links',
        order: 4,
        width: '2',
        showTitle: true,
        showBullets: true,
        items: [
          { type: 'link', content: 'Beranda', url: '/', order: 1 },
          { type: 'link', content: 'Kegiatan', url: '/kegiatan', order: 2 },
          { type: 'link', content: 'BKK / Karier', url: '/bkk', order: 3 },
          { type: 'link', content: 'Berita', url: '/artikel', order: 4 },
          { type: 'link', content: 'Kontak', url: '/kontak', order: 5 },
          { type: 'link', content: 'Pendaftaran', url: '/pendaftaran', order: 6 },
        ],
        createdBy: req.user.id,
      },
      {
        title: 'SOCIAL MEDIA',
        type: 'social',
        order: 5,
        width: '2',
        showTitle: true,
        showBullets: false,
        items: [
          { type: 'icon-link', content: 'WHATSAPP', url: 'https://wa.me/6281234567890', icon: 'whatsapp', target: '_blank', order: 1 },
          { type: 'icon-link', content: 'INSTAGRAM', url: 'https://instagram.com/smkkristen5klaten', icon: 'instagram', target: '_blank', order: 2 },
          { type: 'icon-link', content: 'FACEBOOK', url: 'https://facebook.com/smkkristen5klaten', icon: 'facebook', target: '_blank', order: 3 },
          { type: 'icon-link', content: 'YOUTUBE', url: 'https://youtube.com/@smkkristen5klaten', icon: 'youtube', target: '_blank', order: 4 },
        ],
        createdBy: req.user.id,
      },
    ];

    await FooterColumn.insertMany(defaultColumns);

    res.status(201).json({
      success: true,
      message: 'Default footer columns created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
