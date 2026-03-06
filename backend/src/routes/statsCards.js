import express from 'express';
import StatsCard from '../models/StatsCard.js';
import Ekskul from '../models/Ekskul.js';
import Fasilitas from '../models/Fasilitas.js';
import Jurusan from '../models/Jurusan.js';
import SiteSettings from '../models/SiteSettings.js';
import { protect } from '../middleware/auth.js';
import { isAdministrator } from '../middleware/roleCheck.js';

const router = express.Router();

// Helper: resolve the numeric value of a card server-side
const resolveValue = async (card, { ekskuls, fasilitas, jurusans, foundingYear } = {}) => {
  switch (card.dataSource) {
    case 'ekskul':
      return ekskuls ?? (await Ekskul.countDocuments());
    case 'fasilitas':
      return fasilitas ?? (await Fasilitas.countDocuments());
    case 'jurusan':
      return jurusans ?? (await Jurusan.countDocuments());
    case 'tahun': {
      const fy = foundingYear ?? (await SiteSettings.getSettings())?.homepageSections?.foundingYear ?? 1999;
      return new Date().getFullYear() - fy;
    }
    default:
      return card.customValue;
  }
};

// @route   GET /api/stats-cards/public
// @desc    Get all visible cards with resolved values
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const cards = await StatsCard.find({ isVisible: true }).sort({ order: 1, createdAt: 1 }).lean();

    // Batch counts for efficiency
    const [ekskulCount, fasilitasCount, jurusanCount, settings] = await Promise.all([
      Ekskul.countDocuments(),
      Fasilitas.countDocuments(),
      Jurusan.countDocuments(),
      SiteSettings.getSettings(),
    ]);
    const foundingYear = settings?.homepageSections?.foundingYear ?? 1999;

    const resolved = cards.map((card) => ({
      ...card,
      resolvedValue: (() => {
        switch (card.dataSource) {
          case 'ekskul': return ekskulCount;
          case 'fasilitas': return fasilitasCount;
          case 'jurusan': return jurusanCount;
          case 'tahun': return new Date().getFullYear() - foundingYear;
          default: return card.customValue;
        }
      })(),
    }));

    res.json({ success: true, data: resolved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

const DEFAULT_CARDS = [
  {
    title: 'EKSTRAKURIKULER',
    description: '',
    dataSource: 'ekskul',
    customValue: '0',
    linkUrl: '/ekskul',
    linkText: 'Lihat Semua Ekskul',
    borderColor: '#008fd7',
    order: 0,
    isVisible: true,
  },
  {
    title: 'FASILITAS',
    description: '',
    dataSource: 'fasilitas',
    customValue: '0',
    linkUrl: '/fasilitas',
    linkText: 'Lihat Semua Fasilitas',
    borderColor: '#fbbf24',
    order: 1,
    isVisible: true,
  },
  {
    title: 'TAHUN MELAYANI',
    description: 'Melayani pendidikan di Klaten sejak tahun 1997',
    dataSource: 'tahun',
    customValue: '0',
    linkUrl: '',
    linkText: 'Lihat Selengkapnya',
    borderColor: '#ef4444',
    order: 2,
    isVisible: true,
  },
  {
    title: 'BIDANG KOMPETENSI',
    description: '',
    dataSource: 'jurusan',
    customValue: '0',
    linkUrl: '/jurusan',
    linkText: 'Lihat Semua Jurusan',
    borderColor: '#ea580c',
    order: 3,
    isVisible: true,
  },
];

// @route   GET /api/stats-cards
// @desc    Get all cards (admin) — auto-seeds defaults if empty
// @access  Admin
router.get('/', protect, isAdministrator, async (req, res) => {
  try {
    let cards = await StatsCard.find().sort({ order: 1, createdAt: 1 });

    // Auto-seed 4 default cards on first access
    if (cards.length === 0) {
      cards = await StatsCard.insertMany(DEFAULT_CARDS);
    }

    res.json({ success: true, data: cards });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/stats-cards
// @desc    Create card
// @access  Admin
router.post('/', protect, isAdministrator, async (req, res) => {
  try {
    const card = await StatsCard.create(req.body);
    res.status(201).json({ success: true, data: card });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   PUT /api/stats-cards/:id
// @desc    Update card
// @access  Admin
router.put('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const card = await StatsCard.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!card) return res.status(404).json({ success: false, message: 'Card tidak ditemukan' });
    res.json({ success: true, data: card });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/stats-cards/:id
// @desc    Delete card
// @access  Admin
router.delete('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const card = await StatsCard.findByIdAndDelete(req.params.id);
    if (!card) return res.status(404).json({ success: false, message: 'Card tidak ditemukan' });
    res.json({ success: true, message: 'Card berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
