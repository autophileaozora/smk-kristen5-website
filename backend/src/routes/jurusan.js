import express from 'express';
import mongoose from 'mongoose';
import Jurusan from '../models/Jurusan.js';
import { protect } from '../middleware/auth.js';
import { isAdministrator } from '../middleware/roleCheck.js';
import { uploadSingle, uploadMultiple, uploadToCloudinary } from '../utils/cloudinaryUpload.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// @route   GET /api/jurusan
// @desc    Get all jurusan
// @access  Public
router.get('/', async (req, res) => {
  try {
    const jurusans = await Jurusan.find()
      .populate('createdBy', 'name')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: { jurusans },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/jurusan/active
// @desc    Get only active jurusan
// @access  Public
router.get('/active', async (req, res) => {
  try {
    const jurusans = await Jurusan.find({ isActive: true })
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: { jurusans },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   GET /api/jurusan/:id
// @desc    Get single jurusan
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const jurusan = isObjectId
      ? await Jurusan.findById(req.params.id).populate('createdBy', 'name')
      : await Jurusan.findOne({ slug: req.params.id }).populate('createdBy', 'name');

    if (!jurusan) {
      return res.status(404).json({
        success: false,
        message: 'Jurusan not found',
      });
    }

    res.status(200).json({
      success: true,
      data: { jurusan },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   POST /api/jurusan
// @desc    Create new jurusan
// @access  Protected + Admin
router.post('/', protect, isAdministrator, uploadMultiple([
  { name: 'logo', maxCount: 1 },
  { name: 'backgroundImage', maxCount: 1 },
  { name: 'galleryImages', maxCount: 10 }
]), async (req, res) => {
  try {
    const {
      name, code, description, shortDescription, vision, mission, headOfDepartment, isActive,
      subjects, facilities, careerProspects, competencies
    } = req.body;

    if (!name || !code || !description) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, code, and description',
      });
    }

    // Check duplicate code
    const existingJurusan = await Jurusan.findOne({ code: code.toUpperCase() });
    if (existingJurusan) {
      return res.status(400).json({
        success: false,
        message: 'Kode jurusan sudah digunakan',
      });
    }

    const jurusanData = {
      name,
      code: code.toUpperCase(),
      description,
      shortDescription: shortDescription || '',
      vision: vision || '',
      mission: mission || '',
      headOfDepartment: headOfDepartment || '',
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user.id,
    };

    // Parse JSON arrays if provided as strings
    if (subjects) {
      jurusanData.subjects = typeof subjects === 'string' ? JSON.parse(subjects) : subjects;
    }
    if (facilities) {
      jurusanData.facilities = typeof facilities === 'string' ? JSON.parse(facilities) : facilities;
    }
    if (careerProspects) {
      jurusanData.careerProspects = typeof careerProspects === 'string' ? JSON.parse(careerProspects) : careerProspects;
    }
    if (competencies) {
      jurusanData.competencies = typeof competencies === 'string' ? JSON.parse(competencies) : competencies;
    }

    // Upload logo to Cloudinary if provided
    if (req.files && req.files.logo && req.files.logo[0]) {
      try {
        console.log('Uploading logo to Cloudinary...');
        const result = await uploadToCloudinary(req.files.logo[0].buffer);
        console.log('Logo upload success:', result.secure_url);
        jurusanData.logo = result.secure_url;
      } catch (uploadError) {
        console.error('Logo upload error:', uploadError);
        const errorMessage = uploadError?.message || uploadError?.error?.message || JSON.stringify(uploadError) || 'Unknown error';
        return res.status(500).json({
          success: false,
          message: 'Failed to upload logo to Cloudinary: ' + errorMessage,
        });
      }
    }

    // Upload backgroundImage to Cloudinary if provided
    if (req.files && req.files.backgroundImage && req.files.backgroundImage[0]) {
      try {
        console.log('Uploading background image to Cloudinary...');
        const result = await uploadToCloudinary(req.files.backgroundImage[0].buffer);
        console.log('Background image upload success:', result.secure_url);
        jurusanData.backgroundImage = result.secure_url;
      } catch (uploadError) {
        console.error('Background image upload error:', uploadError);
        const errorMessage = uploadError?.message || uploadError?.error?.message || JSON.stringify(uploadError) || 'Unknown error';
        return res.status(500).json({
          success: false,
          message: 'Failed to upload background image to Cloudinary: ' + errorMessage,
        });
      }
    }

    // Upload gallery images to Cloudinary if provided
    if (req.files && req.files.galleryImages && req.files.galleryImages.length > 0) {
      try {
        console.log(`Uploading ${req.files.galleryImages.length} gallery images to Cloudinary...`);
        const galleryUrls = [];

        for (const file of req.files.galleryImages) {
          const result = await uploadToCloudinary(file.buffer);
          galleryUrls.push({
            url: result.secure_url,
            caption: '',
            uploadedAt: new Date()
          });
        }

        jurusanData.gallery = galleryUrls;
        console.log(`Gallery images upload success: ${galleryUrls.length} images`);
      } catch (uploadError) {
        console.error('Gallery images upload error:', uploadError);
        const errorMessage = uploadError?.message || uploadError?.error?.message || JSON.stringify(uploadError) || 'Unknown error';
        return res.status(500).json({
          success: false,
          message: 'Failed to upload gallery images to Cloudinary: ' + errorMessage,
        });
      }
    }

    const jurusan = await Jurusan.create(jurusanData);

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'create',
      resource: 'jurusan',
      resourceId: jurusan._id,
      details: {
        name: jurusan.name,
        code: jurusan.code,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(201).json({
      success: true,
      message: 'Jurusan created successfully',
      data: { jurusan },
    });
  } catch (error) {
    console.error('Jurusan creation error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/jurusan/:id/blocks
// @desc    Update jurusan page builder blocks
// @access  Protected + Admin
router.put('/:id/blocks', protect, isAdministrator, async (req, res) => {
  try {
    const isObjectId = mongoose.Types.ObjectId.isValid(req.params.id);
    const jurusan = isObjectId
      ? await Jurusan.findById(req.params.id)
      : await Jurusan.findOne({ slug: req.params.id });

    if (!jurusan) {
      return res.status(404).json({
        success: false,
        message: 'Jurusan not found',
      });
    }

    jurusan.blocks = req.body.blocks || [];
    await jurusan.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'jurusan',
      resourceId: jurusan._id,
      details: {
        action: 'blocks_update',
        blocksCount: jurusan.blocks.length,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Jurusan blocks updated successfully',
      data: { jurusan },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   PUT /api/jurusan/:id
// @desc    Update jurusan
// @access  Protected + Admin
router.put('/:id', protect, isAdministrator, uploadMultiple([
  { name: 'logo', maxCount: 1 },
  { name: 'backgroundImage', maxCount: 1 },
  { name: 'galleryImages', maxCount: 10 }
]), async (req, res) => {
  try {
    const jurusan = await Jurusan.findById(req.params.id);

    if (!jurusan) {
      return res.status(404).json({
        success: false,
        message: 'Jurusan not found',
      });
    }

    const {
      name, code, description, shortDescription, vision, mission, headOfDepartment, isActive,
      subjects, facilities, careerProspects, competencies, logo, backgroundImage
    } = req.body;

    // Check duplicate code if code is being changed
    if (code && code.toUpperCase() !== jurusan.code) {
      const existingJurusan = await Jurusan.findOne({ code: code.toUpperCase() });
      if (existingJurusan) {
        return res.status(400).json({
          success: false,
          message: 'Kode jurusan sudah digunakan',
        });
      }
    }

    jurusan.name = name || jurusan.name;
    jurusan.code = code ? code.toUpperCase() : jurusan.code;
    jurusan.description = description || jurusan.description;
    jurusan.shortDescription = shortDescription !== undefined ? shortDescription : jurusan.shortDescription;
    jurusan.vision = vision !== undefined ? vision : jurusan.vision;
    jurusan.mission = mission !== undefined ? mission : jurusan.mission;
    jurusan.headOfDepartment = headOfDepartment !== undefined ? headOfDepartment : jurusan.headOfDepartment;
    jurusan.isActive = isActive !== undefined ? isActive : jurusan.isActive;

    // Parse JSON arrays if provided
    if (subjects !== undefined) {
      jurusan.subjects = typeof subjects === 'string' ? JSON.parse(subjects) : subjects;
    }
    if (facilities !== undefined) {
      jurusan.facilities = typeof facilities === 'string' ? JSON.parse(facilities) : facilities;
    }
    if (careerProspects !== undefined) {
      jurusan.careerProspects = typeof careerProspects === 'string' ? JSON.parse(careerProspects) : careerProspects;
    }
    if (competencies !== undefined) {
      jurusan.competencies = typeof competencies === 'string' ? JSON.parse(competencies) : competencies;
    }

    // Upload new logo to Cloudinary if provided
    if (req.files && req.files.logo && req.files.logo[0]) {
      try {
        console.log('Uploading logo to Cloudinary...');
        const result = await uploadToCloudinary(req.files.logo[0].buffer);
        console.log('Logo upload success:', result.secure_url);
        jurusan.logo = result.secure_url;
      } catch (uploadError) {
        console.error('Logo upload error:', uploadError);
        const errorMessage = uploadError?.message || uploadError?.error?.message || JSON.stringify(uploadError) || 'Unknown error';
        return res.status(500).json({
          success: false,
          message: 'Failed to upload logo to Cloudinary: ' + errorMessage,
        });
      }
    } else if (logo !== undefined) {
      jurusan.logo = logo;
    }

    // Upload new backgroundImage to Cloudinary if provided
    if (req.files && req.files.backgroundImage && req.files.backgroundImage[0]) {
      try {
        console.log('Uploading background image to Cloudinary...');
        const result = await uploadToCloudinary(req.files.backgroundImage[0].buffer);
        console.log('Background image upload success:', result.secure_url);
        jurusan.backgroundImage = result.secure_url;
      } catch (uploadError) {
        console.error('Background image upload error:', uploadError);
        const errorMessage = uploadError?.message || uploadError?.error?.message || JSON.stringify(uploadError) || 'Unknown error';
        return res.status(500).json({
          success: false,
          message: 'Failed to upload background image to Cloudinary: ' + errorMessage,
        });
      }
    } else if (backgroundImage !== undefined) {
      jurusan.backgroundImage = backgroundImage;
    }

    // Upload new gallery images to Cloudinary if provided
    if (req.files && req.files.galleryImages && req.files.galleryImages.length > 0) {
      try {
        console.log(`Uploading ${req.files.galleryImages.length} gallery images to Cloudinary...`);
        const galleryUrls = [];

        for (const file of req.files.galleryImages) {
          const result = await uploadToCloudinary(file.buffer);
          galleryUrls.push({
            url: result.secure_url,
            caption: '',
            uploadedAt: new Date()
          });
        }

        // Append new images to existing gallery
        jurusan.gallery = [...(jurusan.gallery || []), ...galleryUrls];
        console.log(`Gallery images upload success: ${galleryUrls.length} images added`);
      } catch (uploadError) {
        console.error('Gallery images upload error:', uploadError);
        const errorMessage = uploadError?.message || uploadError?.error?.message || JSON.stringify(uploadError) || 'Unknown error';
        return res.status(500).json({
          success: false,
          message: 'Failed to upload gallery images to Cloudinary: ' + errorMessage,
        });
      }
    }

    await jurusan.save();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'update',
      resource: 'jurusan',
      resourceId: jurusan._id,
      details: {
        updatedFields: Object.keys(req.body),
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Jurusan updated successfully',
      data: { jurusan },
    });
  } catch (error) {
    console.error('Jurusan update error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// @route   DELETE /api/jurusan/:id
// @desc    Delete jurusan
// @access  Protected + Admin
router.delete('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const jurusan = await Jurusan.findById(req.params.id);

    if (!jurusan) {
      return res.status(404).json({
        success: false,
        message: 'Jurusan not found',
      });
    }

    await jurusan.deleteOne();

    // Audit log
    await AuditLog.create({
      user: req.user.id,
      action: 'delete',
      resource: 'jurusan',
      resourceId: req.params.id,
      details: {
        name: jurusan.name,
        code: jurusan.code,
      },
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    res.status(200).json({
      success: true,
      message: 'Jurusan deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
