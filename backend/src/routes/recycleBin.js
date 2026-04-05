import express from 'express';
import { protect } from '../middleware/auth.js';
import { isAdministrator } from '../middleware/roleCheck.js';
import AuditLog from '../models/AuditLog.js';
import Article from '../models/Article.js';
import Jurusan from '../models/Jurusan.js';
import MataPelajaran from '../models/MataPelajaran.js';
import Ekskul from '../models/Ekskul.js';
import Fasilitas from '../models/Fasilitas.js';
import Prestasi from '../models/Prestasi.js';
import { deleteFromCloudinary, getPublicIdFromUrl } from '../utils/cloudinaryUpload.js';

const router = express.Router();

const MODELS = {
  artikel: Article,
  jurusan: Jurusan,
  'mata-pelajaran': MataPelajaran,
  ekskul: Ekskul,
  fasilitas: Fasilitas,
  prestasi: Prestasi,
};

const TYPE_LABELS = {
  artikel: 'Artikel',
  jurusan: 'Jurusan',
  'mata-pelajaran': 'Mata Pelajaran',
  ekskul: 'Ekstrakurikuler',
  fasilitas: 'Fasilitas',
  prestasi: 'Prestasi',
};

const getItemName = (type, item) => {
  if (type === 'artikel') return item.title;
  return item.name || item.title || 'Tanpa Nama';
};

// Permanently delete a single item and its Cloudinary assets
const hardDelete = async (type, item) => {
  const imageUrls = [];
  if (type === 'artikel' && item.featuredImage?.url) imageUrls.push(item.featuredImage.url);
  if (type === 'jurusan') {
    if (item.logo) imageUrls.push(item.logo);
    if (item.backgroundImage) imageUrls.push(item.backgroundImage);
    for (const g of (item.gallery || [])) { if (g.url) imageUrls.push(g.url); }
  }
  if (['ekskul', 'fasilitas', 'mata-pelajaran', 'prestasi'].includes(type) && item.image) {
    imageUrls.push(item.image);
  }
  for (const url of imageUrls) {
    const publicId = getPublicIdFromUrl(url);
    if (publicId) await deleteFromCloudinary(publicId).catch(() => {});
  }
  await MODELS[type].deleteOne({ _id: item._id });
};

// Auto-purge items older than 2 days (runs in background on each GET)
const autoPurgeExpired = async () => {
  try {
    const cutoff = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    for (const [type, Model] of Object.entries(MODELS)) {
      const expired = await Model.find({ isDeleted: true, deletedAt: { $lt: cutoff } }).lean();
      for (const item of expired) {
        await hardDelete(type, item);
      }
    }
  } catch (_) {
    // Background task — silently ignore errors
  }
};

// @route   GET /api/recycle-bin
// @desc    List all soft-deleted items grouped newest first
// @access  Admin only
router.get('/', protect, isAdministrator, async (req, res) => {
  // Auto-purge expired items in background (don't await — don't block response)
  autoPurgeExpired();

  try {
    const now = Date.now();
    const results = await Promise.all(
      Object.entries(MODELS).map(async ([type, Model]) => {
        const items = await Model.find({ isDeleted: true }).sort({ deletedAt: -1 }).lean();
        return items.map(item => {
          const deletedMs = item.deletedAt ? new Date(item.deletedAt).getTime() : now;
          const expiresMs = deletedMs + 2 * 24 * 60 * 60 * 1000;
          return {
            _id: item._id,
            type,
            typeLabel: TYPE_LABELS[type],
            name: getItemName(type, item),
            deletedAt: item.deletedAt,
            expiresAt: new Date(expiresMs),
            hoursLeft: Math.max(0, Math.floor((expiresMs - now) / 3600000)),
            image: item.image || item.featuredImage?.url || item.logo || null,
          };
        });
      })
    );

    const allItems = results.flat().sort((a, b) => new Date(b.deletedAt) - new Date(a.deletedAt));

    res.status(200).json({
      success: true,
      data: { items: allItems, total: allItems.length },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/recycle-bin/purge-expired
// @desc    Manually trigger purge of items older than 2 days
// @access  Admin only
router.post('/purge-expired', protect, isAdministrator, async (req, res) => {
  try {
    const cutoff = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
    let totalDeleted = 0;
    for (const [type, Model] of Object.entries(MODELS)) {
      const expired = await Model.find({ isDeleted: true, deletedAt: { $lt: cutoff } }).lean();
      for (const item of expired) {
        await hardDelete(type, item);
        totalDeleted++;
      }
    }
    res.status(200).json({ success: true, message: `${totalDeleted} item dihapus permanen`, data: { totalDeleted } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/recycle-bin/:type/:id/restore
// @desc    Restore a soft-deleted item
// @access  Admin only
router.post('/:type/:id/restore', protect, isAdministrator, async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = MODELS[type];
    if (!Model) return res.status(400).json({ success: false, message: 'Tipe tidak valid' });

    const item = await Model.findOne({ _id: id, isDeleted: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item tidak ditemukan di recycle bin' });

    item.isDeleted = false;
    item.deletedAt = null;
    await item.save();

    await AuditLog.create({
      user: req.user.id,
      action: 'restore',
      resource: type,
      resourceId: item._id,
      details: { name: getItemName(type, item) },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({ success: true, message: `${TYPE_LABELS[type]} berhasil dipulihkan` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/recycle-bin/:type/:id
// @desc    Permanently delete a single item
// @access  Admin only
router.delete('/:type/:id', protect, isAdministrator, async (req, res) => {
  try {
    const { type, id } = req.params;
    const Model = MODELS[type];
    if (!Model) return res.status(400).json({ success: false, message: 'Tipe tidak valid' });

    const item = await Model.findOne({ _id: id, isDeleted: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item tidak ditemukan di recycle bin' });

    await hardDelete(type, item);

    await AuditLog.create({
      user: req.user.id,
      action: 'permanent_delete',
      resource: type,
      resourceId: id,
      details: { name: getItemName(type, item) },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({ success: true, message: `${TYPE_LABELS[type]} dihapus permanen` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
