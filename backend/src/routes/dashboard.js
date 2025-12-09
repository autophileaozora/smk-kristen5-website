import express from 'express';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';
import Article from '../models/Article.js';
import Prestasi from '../models/Prestasi.js';
import Jurusan from '../models/Jurusan.js';
import Ekskul from '../models/Ekskul.js';
import Alumni from '../models/Alumni.js';
import VideoHero from '../models/VideoHero.js';
import RunningText from '../models/RunningText.js';
import Category from '../models/Category.js';

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Protected
router.get('/stats', protect, async (req, res) => {
  try {
    const isAdmin = req.user.role === 'administrator';

    // Fetch all counts in parallel
    const [
      totalUsers,
      totalArticles,
      publishedArticles,
      draftArticles,
      totalPrestasi,
      activePrestasi,
      totalJurusan,
      totalEkskul,
      activeEkskul,
      totalAlumni,
      publishedAlumni,
      featuredAlumni,
      totalVideoHero,
      activeVideoHero,
      totalRunningText,
      activeRunningText,
      totalCategories,
    ] = await Promise.all([
      // Users (admin only)
      isAdmin ? User.countDocuments() : Promise.resolve(0),
      
      // Articles
      Article.countDocuments(),
      Article.countDocuments({ status: 'published' }),
      Article.countDocuments({ status: 'draft' }),
      
      // Prestasi
      Prestasi.countDocuments(),
      Prestasi.countDocuments({ isActive: true }),
      
      // Jurusan
      Jurusan.countDocuments(),
      
      // Ekskul
      Ekskul.countDocuments(),
      Ekskul.countDocuments({ isActive: true }),
      
      // Alumni
      Alumni.countDocuments(),
      Alumni.countDocuments({ isPublished: true }),
      Alumni.countDocuments({ isFeatured: true, isPublished: true }),
      
      // Video Hero
      VideoHero.countDocuments(),
      VideoHero.countDocuments({ isActive: true }),
      
      // Running Text
      RunningText.countDocuments(),
      RunningText.countDocuments({ isActive: true }),
      
      // Categories
      Category.countDocuments(),
    ]);

    // Build response based on user role
    const stats = {
      articles: {
        total: totalArticles,
        published: publishedArticles,
        draft: draftArticles,
      },
      prestasi: {
        total: totalPrestasi,
        active: activePrestasi,
      },
      jurusan: {
        total: totalJurusan,
      },
      ekskul: {
        total: totalEkskul,
        active: activeEkskul,
      },
      alumni: {
        total: totalAlumni,
        published: publishedAlumni,
        featured: featuredAlumni,
      },
      videoHero: {
        total: totalVideoHero,
        active: activeVideoHero,
      },
      runningText: {
        total: totalRunningText,
        active: activeRunningText,
      },
      categories: {
        total: totalCategories,
      },
    };

    // Add user stats for admin only
    if (isAdmin) {
      stats.users = {
        total: totalUsers,
      };
    }

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/dashboard/recent-activity
// @desc    Get recent activity logs
// @access  Protected
router.get('/recent-activity', protect, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    // Get recent articles
    const recentArticles = await Article.find()
      .select('title status createdAt updatedAt')
      .sort({ updatedAt: -1 })
      .limit(limit)
      .populate('author', 'name');

    // Get recent prestasi
    const recentPrestasi = await Prestasi.find()
      .select('title isActive createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent alumni
    const recentAlumni = await Alumni.find()
      .select('name graduationYear isPublished createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Format activities
    const activities = [];

    recentArticles.forEach(article => {
      activities.push({
        type: 'article',
        action: article.status === 'published' ? 'published' : 'created',
        title: article.title,
        user: article.author?.name,
        timestamp: article.updatedAt,
      });
    });

    recentPrestasi.forEach(prestasi => {
      activities.push({
        type: 'prestasi',
        action: prestasi.isActive ? 'activated' : 'created',
        title: prestasi.title,
        timestamp: prestasi.createdAt,
      });
    });

    recentAlumni.forEach(alumni => {
      activities.push({
        type: 'alumni',
        action: alumni.isPublished ? 'published' : 'created',
        title: `${alumni.name} (${alumni.graduationYear})`,
        timestamp: alumni.createdAt,
      });
    });

    // Sort by timestamp and limit
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const limitedActivities = activities.slice(0, limit);

    res.status(200).json({
      success: true,
      data: { activities: limitedActivities },
    });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/dashboard/summary
// @desc    Get quick summary for homepage
// @access  Protected
router.get('/summary', protect, async (req, res) => {
  try {
    const [
      publishedArticles,
      activePrestasi,
      publishedAlumni,
      activeVideoHero,
    ] = await Promise.all([
      Article.countDocuments({ status: 'published' }),
      Prestasi.countDocuments({ isActive: true }),
      Alumni.countDocuments({ isPublished: true }),
      VideoHero.countDocuments({ isActive: true }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        publishedArticles,
        activePrestasi,
        publishedAlumni,
        activeVideoHero,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
