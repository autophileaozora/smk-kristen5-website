import express from 'express';
import AlumniSubmission from '../models/AlumniSubmission.js';
import Alumni from '../models/Alumni.js';
import { protect } from '../middleware/auth.js';
import { isAdministrator } from '../middleware/roleCheck.js';
import { uploadSingle, uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// @route   GET /api/alumni-submissions/count
// @desc    Get count of pending submissions (for admin badge)
// @access  Public (badge visible without login)
router.get('/count', async (req, res) => {
  try {
    const pending = await AlumniSubmission.countDocuments({ status: 'pending' });
    res.json({ success: true, pending });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   POST /api/alumni-submissions
// @desc    Submit alumni review (public)
// @access  Public
router.post('/', uploadSingle('photo'), async (req, res) => {
  try {
    const { name, graduationYear, jurusan, currentOccupation, company, phone, testimonial } = req.body;

    if (!name || !graduationYear || !jurusan || !testimonial) {
      return res.status(400).json({
        success: false,
        message: 'Name, graduation year, jurusan, and testimonial are required',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Photo is required',
      });
    }

    // Upload photo to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(
      req.file.buffer,
      'smk-kristen5/alumni-submissions'
    );

    const submission = new AlumniSubmission({
      name: name.trim(),
      photo: {
        url: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
      },
      graduationYear: parseInt(graduationYear),
      jurusan: jurusan.trim(),
      currentOccupation: currentOccupation?.trim() || undefined,
      company: company?.trim() || undefined,
      phone: phone?.trim() || undefined,
      testimonial: testimonial.trim(),
    });

    await submission.save();

    res.status(201).json({
      success: true,
      message: 'Submission received successfully',
      data: { id: submission._id },
    });
  } catch (error) {
    console.error('Alumni submission error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// ── Admin routes below (require auth) ──────────────────────────────────────

// @route   GET /api/alumni-submissions
// @desc    Get all submissions (admin)
// @access  Admin
router.get('/', protect, isAdministrator, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      filter.status = status;
    }

    const submissions = await AlumniSubmission.find(filter)
      .populate('reviewedBy', 'name')
      .sort({ createdAt: -1 });

    // Count by status
    const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
      AlumniSubmission.countDocuments({ status: 'pending' }),
      AlumniSubmission.countDocuments({ status: 'approved' }),
      AlumniSubmission.countDocuments({ status: 'rejected' }),
    ]);

    res.json({
      success: true,
      data: {
        submissions,
        counts: { pending: pendingCount, approved: approvedCount, rejected: rejectedCount },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/alumni-submissions/:id/approve
// @desc    Approve submission and create Alumni entry
// @access  Admin
router.patch('/:id/approve', protect, isAdministrator, async (req, res) => {
  try {
    const submission = await AlumniSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    if (submission.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Submission has already been reviewed' });
    }

    // Create Alumni entry from submission
    const alumni = new Alumni({
      name: submission.name,
      photo: submission.photo?.url || null,
      graduationYear: submission.graduationYear,
      jurusan: submission.jurusan,
      currentOccupation: submission.currentOccupation,
      company: submission.company,
      testimonial: submission.testimonial,
      isPublished: true,
      isFeatured: false,
      createdBy: req.user._id,
    });
    await alumni.save();

    // Update submission status
    submission.status = 'approved';
    submission.linkedAlumniId = alumni._id;
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = new Date();
    await submission.save();

    // Audit log
    await AuditLog.create({
      user: req.user._id,
      action: 'approve',
      resource: 'alumniSubmission',
      resourceId: submission._id,
      details: { alumniCreated: alumni._id, alumniName: alumni.name },
    });

    res.json({
      success: true,
      message: `Review dari ${submission.name} telah disetujui dan ditambahkan ke daftar alumni`,
      data: { submission, alumni },
    });
  } catch (error) {
    console.error('Approve submission error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   PATCH /api/alumni-submissions/:id/reject
// @desc    Reject submission
// @access  Admin
router.patch('/:id/reject', protect, isAdministrator, async (req, res) => {
  try {
    const submission = await AlumniSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    if (submission.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Submission has already been reviewed' });
    }

    submission.status = 'rejected';
    submission.rejectionReason = req.body.reason?.trim() || undefined;
    submission.reviewedBy = req.user._id;
    submission.reviewedAt = new Date();
    await submission.save();

    await AuditLog.create({
      user: req.user._id,
      action: 'reject',
      resource: 'alumniSubmission',
      resourceId: submission._id,
      details: { name: submission.name, reason: submission.rejectionReason },
    });

    res.json({ success: true, message: 'Submission rejected', data: { submission } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   DELETE /api/alumni-submissions/:id
// @desc    Delete submission
// @access  Admin
router.delete('/:id', protect, isAdministrator, async (req, res) => {
  try {
    const submission = await AlumniSubmission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    // Delete photo from Cloudinary
    if (submission.photo?.publicId) {
      try {
        await deleteFromCloudinary(submission.photo.publicId);
      } catch (cloudErr) {
        console.error('Failed to delete Cloudinary photo:', cloudErr);
      }
    }

    await submission.deleteOne();

    await AuditLog.create({
      user: req.user._id,
      action: 'delete',
      resource: 'alumniSubmission',
      resourceId: req.params.id,
      details: { name: submission.name },
    });

    res.json({ success: true, message: 'Submission deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;