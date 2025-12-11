import express from 'express';
import Fasilitas from '../models/Fasilitas.js';
import { protect } from '../middleware/auth.js';
import { isAdministrator } from '../middleware/roleCheck.js';
import { uploadSingle, uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// @route   GET /api/fasilitas
// @desc    Get all fasilitas (optionally filter by category)
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};

    if (category) {
      // If category specified, get items for that category OR public items
      filter.$or = [
        { category: category.toUpperCase() },
        { category: 'PUBLIC' }
      ];
    }

    const fasilitas = await Fasilitas.find(filter)
      .populate('createdBy', 'name')
      .sort({ displayOrder: 1, name: 1 });

    res.status(200).json({
      success: true,
      data: { fasilitas },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/fasilitas/active
// @desc    Get only active fasilitas
// @access  Public
router.get('/active', async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true };

    if (category) {
      filter.$or = [
        { category: category.toUpperCase() },
        { category: 'PUBLIC' }
      ];
    }

    const fasilitas = await Fasilitas.find(filter)
      .sort({ displayOrder: 1, name: 1 });

    res.status(200).json({
      success: true,
      data: { fasilitas },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/fasilitas/:id
// @desc    Get single fasilitas
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const fasilitas = await Fasilitas.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!fasilitas) {
      return res.status(404).json({
        success: false,
        message: 'Fasilitas not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { fasilitas },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/fasilitas
// @desc    Create new fasilitas
// @access  Protected + Admin
router.post('/', protect, isAdministrator, uploadSingle('image'), async (req, res) => {
  try {
    const { name, description, category, location, capacity, isActive, displayOrder } = req.body;

    if (!name || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, description, and category',
      });
    }

    const fasilitasData = {
      name,
      description,
      category: category.toUpperCase(),
      location: location || '',
      capacity: capacity || null,
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: displayOrder || 0,
      createdBy: req.user.id,
    };

    // Upload image to Cloudinary if provided
    if (req.file) {
      try {
        console.log('Uploading image to Cloudinary...');
        const result = await uploadToCloudinary(req.file.buffer);
        console.log('Image upload success:', result.secure_url);
        fasilitasData.image = result.secure_url;
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        const errorMessage = uploadError?.message || uploadError?.error?.message || JSON.stringify(uploadError) || 'Unknown error';
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image to Cloudinary: ' + errorMessage,
        });
      }
    }

    const fasilitas = await Fasilitas.create(fasilitasData);

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'create',
      resource: 'fasilitas',
      resourceId: fasilitas._id,
      details: {
        name: fasilitas.name,
        category: fasilitas.category,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      success: true,
      message: 'Fasilitas created successfully',
      data: { fasilitas },
    });
  } catch (error) {
    console.error('Fasilitas creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/fasilitas/:id
// @desc    Update fasilitas
// @access  Protected + Admin
router.put('/:id', protect, isAdministrator, uploadSingle('image'), async (req, res) => {
  try {
    const fasilitas = await Fasilitas.findById(req.params.id);

    if (!fasilitas) {
      return res.status(404).json({
        success: false,
        message: 'Fasilitas not found',
      });
    }

    const { name, description, category, location, capacity, isActive, displayOrder, image } = req.body;

    fasilitas.name = name || fasilitas.name;
    fasilitas.description = description || fasilitas.description;
    fasilitas.category = category ? category.toUpperCase() : fasilitas.category;
    fasilitas.location = location !== undefined ? location : fasilitas.location;
    fasilitas.capacity = capacity !== undefined ? capacity : fasilitas.capacity;
    fasilitas.isActive = isActive !== undefined ? isActive : fasilitas.isActive;
    fasilitas.displayOrder = displayOrder !== undefined ? displayOrder : fasilitas.displayOrder;

    // Upload new image to Cloudinary if provided
    if (req.file) {
      try {
        console.log('Uploading image to Cloudinary...');
        const result = await uploadToCloudinary(req.file.buffer);
        console.log('Image upload success:', result.secure_url);
        fasilitas.image = result.secure_url;
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        const errorMessage = uploadError?.message || uploadError?.error?.message || JSON.stringify(uploadError) || 'Unknown error';
        return res.status(500).json({
          success: false,
          message: 'Failed to upload image to Cloudinary: ' + errorMessage,
        });
      }
    } else if (image !== undefined) {
      fasilitas.image = image;
    }

    await fasilitas.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'fasilitas',
      resourceId: fasilitas._id,
      details: {
        updatedFields: Object.keys(req.body),
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Fasilitas updated successfully',
      data: { fasilitas },
    });
  } catch (error) {
    console.error('Fasilitas update error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/fasilitas/:id
// @desc    Delete fasilitas
// @access  Protected + Admin
router.delete('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const fasilitas = await Fasilitas.findById(req.params.id);

    if (!fasilitas) {
      return res.status(404).json({
        success: false,
        message: 'Fasilitas not found',
      });
    }

    await fasilitas.deleteOne();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'delete',
      resource: 'fasilitas',
      resourceId: req.params.id,
      details: {
        name: fasilitas.name,
        category: fasilitas.category,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Fasilitas deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
