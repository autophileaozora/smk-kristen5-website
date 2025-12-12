import express from 'express';
import Article from '../models/Article.js';
import { protect } from '../middleware/auth.js';
import { isAdministrator } from '../middleware/roleCheck.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// @route   GET /api/articles/public
// @desc    Get published articles (public access)
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const { jurusanCode, limit = 10 } = req.query;

    const query = { status: 'published' };

    // Filter by jurusan code if provided
    if (jurusanCode) {
      // First find the category with this jurusan code
      const Category = (await import('../models/Category.js')).default;
      const jurusanCategory = await Category.findOne({
        name: jurusanCode.toUpperCase(),
        type: 'jurusan'
      });

      if (jurusanCategory) {
        query.categoryJurusan = jurusanCategory._id;
      }
    }

    const articles = await Article.find(query)
      .populate('categoryJurusan', 'name slug')
      .populate('categoryTopik', 'name slug')
      .populate('author', 'name')
      .sort({ publishedAt: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: { articles }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/articles/slug/:slug
// @desc    Get single article by slug (public access)
// @access  Public
router.get('/slug/:slug', async (req, res) => {
  try {
    const article = await Article.findOne({
      slug: req.params.slug,
      status: 'published'
    })
      .populate('categoryJurusan', 'name code slug')
      .populate('categoryTopik', 'name slug')
      .populate('author', 'name');

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { article },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/articles
// @desc    Get all articles (admin) or own articles (siswa)
// @access  Protected
router.get('/', protect, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      categoryJurusan,
      categoryTopik,
      timeRange,
      status,
      author,
    } = req.query;

    const query = {};

    // Admin sees all, Siswa sees only own
    if (req.user.role !== 'administrator') {
      query.author = req.user.id;
    }

    // Search by title
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Filter by categoryJurusan (multiple)
    if (categoryJurusan) {
      const jurusanIds = categoryJurusan.split(',').filter(id => id);
      if (jurusanIds.length > 0) {
        query.categoryJurusan = { $in: jurusanIds };
      }
    }

    // Filter by categoryTopik (multiple)
    if (categoryTopik) {
      const topikIds = categoryTopik.split(',').filter(id => id);
      if (topikIds.length > 0) {
        query.categoryTopik = { $in: topikIds };
      }
    }

    // Filter by timeRange
    if (timeRange) {
      const now = new Date();
      let startDate;

      switch (timeRange) {
        case 'today':
          startDate = new Date(now.setHours(0, 0, 0, 0));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        query.createdAt = { $gte: startDate };
      }
    }

    // Filter by status (multiple)
    if (status) {
      const statusValues = status.split(',').filter(s => s);
      if (statusValues.length > 0) {
        query.status = { $in: statusValues };
      }
    }

    // Filter by author (admin only)
    if (author && req.user.role === 'administrator') {
      query.author = author;
    }

    const total = await Article.countDocuments(query);
    const articles = await Article.find(query)
      .populate('categoryJurusan', 'name slug type')
      .populate('categoryTopik', 'name slug type')
      .populate('author', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.status(200).json({
      success: true,
      data: {
        articles,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/articles/:id
// @desc    Get single article
// @access  Protected
router.get('/:id', protect, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id)
      .populate('categoryJurusan', 'name slug type')
      .populate('categoryTopik', 'name slug type')
      .populate('author', 'name email');

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    // Check permission
    if (
      req.user.role !== 'administrator' &&
      article.author._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this article',
      });
    }

    res.status(200).json({
      success: true,
      data: { article },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/articles
// @desc    Create new article
// @access  Protected
router.post('/', protect, async (req, res) => {
  try {
    const { title, content, excerpt, categoryJurusan, categoryTopik, featuredImage } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and content',
      });
    }

    if (!categoryTopik) {
      return res.status(400).json({
        success: false,
        message: 'Topic category is required',
      });
    }

    const article = await Article.create({
      title,
      content,
      excerpt,
      categoryJurusan: categoryJurusan || null,
      categoryTopik,
      featuredImage: featuredImage ? { url: featuredImage } : undefined,
      author: req.user.id,
      status: 'draft',
    });

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'create',
      resource: 'article',
      resourceId: article._id,
      details: {
        title: article.title,
        status: article.status,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    const populatedArticle = await Article.findById(article._id)
      .populate('categoryJurusan', 'name slug')
      .populate('categoryTopik', 'name slug')
      .populate('author', 'name email');

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: { article: populatedArticle },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/articles/:id
// @desc    Update article
// @access  Protected
router.put('/:id', protect, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    // Check permission
    const isOwner = article.author.toString() === req.user.id;
    const isAdmin = req.user.role === 'administrator';

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this article',
      });
    }

    // Siswa can only edit draft or rejected
    if (!isAdmin && !['draft', 'rejected'].includes(article.status)) {
      return res.status(403).json({
        success: false,
        message: 'Cannot edit article in current status',
      });
    }

    const { title, content, excerpt, categoryJurusan, categoryTopik, featuredImage } = req.body;

    article.title = title || article.title;
    article.content = content || article.content;
    article.excerpt = excerpt || article.excerpt;
    if (categoryJurusan !== undefined) article.categoryJurusan = categoryJurusan || null;
    if (categoryTopik !== undefined) article.categoryTopik = categoryTopik || null;
    if (featuredImage !== undefined) {
      article.featuredImage = featuredImage ? { url: featuredImage } : undefined;
    }

    await article.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'article',
      resourceId: article._id,
      details: {
        title: article.title,
        updatedFields: Object.keys(req.body),
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    const populatedArticle = await Article.findById(article._id)
      .populate('categoryJurusan', 'name slug type')
      .populate('categoryTopik', 'name slug type')
      .populate('author', 'name email');

    res.status(200).json({
      success: true,
      message: 'Article updated successfully',
      data: { article: populatedArticle },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/articles/:id
// @desc    Delete article
// @access  Protected
router.delete('/:id', protect, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    // Check permission
    const isOwner = article.author.toString() === req.user.id;
    const isAdmin = req.user.role === 'administrator';

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this article',
      });
    }

    // Siswa cannot delete published articles
    if (!isAdmin && article.status === 'published') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete published article',
      });
    }

    await article.deleteOne();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'delete',
      resource: 'article',
      resourceId: article._id,
      details: {
        title: article.title,
        status: article.status,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Article deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PATCH /api/articles/:id/submit
// @desc    Submit article for approval (siswa)
// @access  Protected
router.patch('/:id/submit', protect, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    // Must be owner
    if (article.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized',
      });
    }

    // Must be draft
    if (article.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Only draft articles can be submitted',
      });
    }

    article.status = 'pending';
    await article.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'article',
      resourceId: article._id,
      details: {
        action: 'submit_for_approval',
        previousStatus: 'draft',
        newStatus: 'pending',
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Article submitted for approval',
      data: { article },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PATCH /api/articles/:id/approve
// @desc    Approve article (admin only)
// @access  Protected + Admin
router.patch('/:id/approve', protect, isAdministrator, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    if (article.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending articles can be approved',
      });
    }

    article.status = 'published';
    article.publishedAt = new Date();
    await article.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'article',
      resourceId: article._id,
      details: {
        action: 'approve_article',
        previousStatus: 'pending',
        newStatus: 'published',
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Article approved and published',
      data: { article },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PATCH /api/articles/:id/reject
// @desc    Reject article (admin only)
// @access  Protected + Admin
router.patch('/:id/reject', protect, isAdministrator, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    if (article.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending articles can be rejected',
      });
    }

    article.status = 'rejected';
    await article.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'article',
      resourceId: article._id,
      details: {
        action: 'reject_article',
        previousStatus: 'pending',
        newStatus: 'rejected',
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Article rejected',
      data: { article },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PATCH /api/articles/:id/unpublish
// @desc    Unpublish article (admin only)
// @access  Protected + Admin
router.patch('/:id/unpublish', protect, isAdministrator, async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found',
      });
    }

    if (article.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Only published articles can be unpublished',
      });
    }

    article.status = 'draft';
    article.publishedAt = null;
    await article.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'article',
      resourceId: article._id,
      details: {
        action: 'unpublish_article',
        previousStatus: 'published',
        newStatus: 'draft',
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Article unpublished',
      data: { article },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
