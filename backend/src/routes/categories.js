import express from 'express';
import Category from '../models/Category.js';
import { protect } from '../middleware/auth.js';
import { isAdministrator } from '../middleware/roleCheck.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// @route   GET /api/categories/public
// @desc    Get all categories (Public - no auth required)
// @access  Public
router.get('/public', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/categories
// @desc    Get all categories
// @access  Protected
router.get('/', protect, async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: { categories },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/categories/:id
// @desc    Get single category
// @access  Protected
router.get('/:id', protect, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { category },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/categories
// @desc    Create new category
// @access  Protected + Admin
router.post('/', protect, isAdministrator, async (req, res) => {
  try {
    const { name, slug, type, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category name',
      });
    }

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Please provide category type (jurusan or topik)',
      });
    }

    // Check duplicate slug
    if (slug) {
      const existingCategory = await Category.findOne({ slug });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Slug already in use',
        });
      }
    }

    const category = await Category.create({
      name,
      slug,
      type,
      description,
      createdBy: req.user.id,
    });

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'create',
      resource: 'category',
      resourceId: category._id,
      details: {
        name: category.name,
        slug: category.slug,
        type: category.type,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: { category },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Protected + Admin
router.put('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const { name, slug, type, description } = req.body;

    // Check duplicate slug
    if (slug && slug !== category.slug) {
      const existingCategory = await Category.findOne({ slug });
      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Slug already in use',
        });
      }
    }

    category.name = name || category.name;
    category.slug = slug || category.slug;
    category.type = type || category.type;
    category.description = description || category.description;

    await category.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'category',
      resourceId: category._id,
      details: {
        name: category.name,
        updatedFields: Object.keys(req.body),
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: { category },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Protected + Admin
router.delete('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Check if category is in use
    const Article = (await import('../models/Article.js')).default;
    const articlesUsingCategory = await Article.countDocuments({
      category: category._id,
    });

    if (articlesUsingCategory > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. ${articlesUsingCategory} article(s) are using this category`,
      });
    }

    await category.deleteOne();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'delete',
      resource: 'category',
      resourceId: category._id,
      details: {
        name: category.name,
        slug: category.slug,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
