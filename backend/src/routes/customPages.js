import express from 'express';
import CustomPage from '../models/CustomPage.js';
import { protect } from '../middleware/auth.js';
import { isAdministrator } from '../middleware/roleCheck.js';

const router = express.Router();

// Get all custom pages (Admin)
router.get('/', protect, isAdministrator, async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;
    const total = await CustomPage.countDocuments(query);
    const pages = await CustomPage.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: {
        pages,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching custom pages:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single custom page by slug (Public)
router.get('/public/:slug', async (req, res) => {
  try {
    const page = await CustomPage.findOne({
      slug: req.params.slug,
      status: 'published',
    });

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    res.json({ success: true, data: page });
  } catch (error) {
    console.error('Error fetching custom page:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get single custom page by ID (Admin)
router.get('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const page = await CustomPage.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    res.json({ success: true, data: page });
  } catch (error) {
    console.error('Error fetching custom page:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Create new custom page
router.post('/', protect, isAdministrator, async (req, res) => {
  try {
    const { title, slug, description, blocks, status, seo } = req.body;

    // Check if slug already exists
    if (slug) {
      const existingPage = await CustomPage.findOne({ slug });
      if (existingPage) {
        return res.status(400).json({ success: false, message: 'Slug already exists' });
      }
    }

    const page = new CustomPage({
      title,
      slug,
      description,
      blocks: blocks || [],
      status: status || 'draft',
      seo,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    });

    await page.save();

    res.status(201).json({
      success: true,
      message: 'Custom page created successfully',
      data: page,
    });
  } catch (error) {
    console.error('Error creating custom page:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update custom page
router.put('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const { title, slug, description, blocks, status, seo } = req.body;

    // Check if slug already exists (excluding current page)
    if (slug) {
      const existingPage = await CustomPage.findOne({
        slug,
        _id: { $ne: req.params.id },
      });
      if (existingPage) {
        return res.status(400).json({ success: false, message: 'Slug already exists' });
      }
    }

    const page = await CustomPage.findByIdAndUpdate(
      req.params.id,
      {
        title,
        slug,
        description,
        blocks,
        status,
        seo,
        updatedBy: req.user.id,
      },
      { new: true, runValidators: true }
    );

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    res.json({
      success: true,
      message: 'Custom page updated successfully',
      data: page,
    });
  } catch (error) {
    console.error('Error updating custom page:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete custom page
router.delete('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const page = await CustomPage.findByIdAndDelete(req.params.id);

    if (!page) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    res.json({
      success: true,
      message: 'Custom page deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting custom page:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Duplicate custom page
router.post('/:id/duplicate', protect, isAdministrator, async (req, res) => {
  try {
    const originalPage = await CustomPage.findById(req.params.id);

    if (!originalPage) {
      return res.status(404).json({ success: false, message: 'Page not found' });
    }

    const duplicatedPage = new CustomPage({
      title: `${originalPage.title} (Copy)`,
      slug: `${originalPage.slug}-copy-${Date.now()}`,
      description: originalPage.description,
      blocks: originalPage.blocks,
      status: 'draft',
      seo: originalPage.seo,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    });

    await duplicatedPage.save();

    res.status(201).json({
      success: true,
      message: 'Custom page duplicated successfully',
      data: duplicatedPage,
    });
  } catch (error) {
    console.error('Error duplicating custom page:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;