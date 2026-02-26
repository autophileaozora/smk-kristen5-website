import express from 'express';
import Jurusan from '../models/Jurusan.js';
import Article from '../models/Article.js';
import Ekskul from '../models/Ekskul.js';
import Alumni from '../models/Alumni.js';
import Partner from '../models/Partner.js';
import Fasilitas from '../models/Fasilitas.js';
import Prestasi from '../models/Prestasi.js';
import HeroSlide from '../models/HeroSlide.js';
import HeroSettings from '../models/HeroSettings.js';
import RunningText from '../models/RunningText.js';
import SocialMedia from '../models/SocialMedia.js';
import Contact from '../models/Contact.js';
import CTA from '../models/CTA.js';
import { ActivityTab, ActivitySettings } from '../models/Activity.js';
import Event from '../models/Event.js';
import SiteSettings from '../models/SiteSettings.js';
import VideoHero from '../models/VideoHero.js';

const router = express.Router();

// @route   GET /api/homepage
// @desc    Get all homepage data in a single request
// @access  Public
router.get('/', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      jurusans,
      articles,
      ekskuls,
      alumni,
      partners,
      fasilitas,
      prestasi,
      heroSlides,
      heroSettings,
      runningTexts,
      prestasiRunning,
      socialMedia,
      contact,
      cta,
      activityTabs,
      activitySettings,
      events,
      siteSettings,
      videoHeroes,
    ] = await Promise.all([
      Jurusan.find().sort({ name: 1 }).lean(),
      Article.find({ status: 'published' })
        .populate('categoryJurusan', 'name slug')
        .populate('categoryTopik', 'name slug')
        .populate('author', 'name')
        .sort({ publishedAt: -1 })
        .limit(6)
        .lean(),
      Ekskul.find().sort({ createdAt: -1 }).lean(),
      Alumni.find({ isPublished: true }).sort({ graduationYear: -1, createdAt: -1 }).lean(),
      Partner.find().sort({ order: 1, createdAt: -1 }).lean(),
      Fasilitas.find().sort({ displayOrder: 1, name: 1 }).lean(),
      Prestasi.find().sort({ date: -1, createdAt: -1 }).lean(),
      HeroSlide.find({ isActive: true })
        .select('-createdBy')
        .sort({ displayOrder: 1 })
        .limit(5)
        .lean(),
      HeroSettings.getSettings(),
      RunningText.find({ isActive: true }).sort({ order: 1 }).lean(),
      Prestasi.find({ showInRunningText: true }).sort({ date: -1 }).limit(10).lean(),
      SocialMedia.find().sort({ order: 1, createdAt: -1 }).lean(),
      Contact.findOne({ isCurrent: true }).lean(),
      CTA.findOne({ isActive: true }).sort({ createdAt: -1 }).lean(),
      ActivityTab.find({ isActive: true })
        .sort({ order: 1 })
        .select('-createdBy -createdAt -updatedAt -__v')
        .lean(),
      ActivitySettings.findOne().lean(),
      Event.find({ isActive: true, eventDate: { $gte: today } })
        .sort({ eventDate: 1, order: 1 })
        .limit(6)
        .select('-createdBy -createdAt -updatedAt -__v')
        .lean(),
      SiteSettings.getSettings(),
      VideoHero.find({ isActive: true }).select('-createdBy').sort({ displayOrder: 1 }).limit(3).lean(),
    ]);

    // Combine running texts with prestasi texts
    const prestasiTexts = prestasiRunning.map(p => ({
      _id: `prestasi-${p._id}`,
      text: `Selamat atas prestasi ${p.participants} - ${p.title}`,
      link: null,
      order: 999,
      isActive: true,
      source: 'prestasi',
      prestasiId: p._id,
    }));

    res.status(200).json({
      success: true,
      data: {
        jurusans,
        articles,
        ekskuls,
        alumni,
        partners,
        fasilitas,
        prestasis: prestasi,
        heroSlides,
        heroSettings: heroSettings || { slideDuration: 5000, autoPlay: true, showIndicators: true },
        runningTexts: [...runningTexts, ...prestasiTexts],
        socialMedia,
        contact,
        cta,
        activityTabs,
        activitySettings: activitySettings || {
          globalLink: '/kegiatan',
          globalButtonText: 'Explore Kegiatan Siswa',
          sectionTitle: 'Pembelajaran & Kegiatan',
          sectionSubtitle: 'Berbagai aktivitas pembelajaran dan kegiatan siswa',
        },
        events,
        siteSettings,
        videoHeroes,
      },
    });
  } catch (error) {
    console.error('Homepage data error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching homepage data',
    });
  }
});

export default router;
