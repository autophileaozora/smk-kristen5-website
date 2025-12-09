import express from 'express';
import AuditLog from '../models/AuditLog.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/audit-logs
// @desc    Get all audit logs with filtering and pagination
// @access  Private/Admin
router.get('/', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'administrator') {
      return res.status(403).json({
        success: false,
        message: 'Tidak memiliki akses. Hanya administrator yang dapat melihat audit log.'
      });
    }

    const {
      page = 1,
      limit = 20,
      action,
      resource,
      userId,
      status,
      startDate,
      endDate
    } = req.query;

    // Build filter query
    const filter = {};

    if (action) filter.action = action;
    if (resource) filter.resource = resource;
    if (userId) filter.user = userId;
    if (status) filter.status = status;

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query with population
    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .populate('user', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      AuditLog.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        logs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalLogs: total,
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil audit log',
      error: error.message
    });
  }
});

// @route   GET /api/audit-logs/stats
// @desc    Get audit log statistics
// @access  Private/Admin
router.get('/stats', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'administrator') {
      return res.status(403).json({
        success: false,
        message: 'Tidak memiliki akses.'
      });
    }

    const stats = await AuditLog.aggregate([
      {
        $group: {
          _id: {
            action: '$action',
            resource: '$resource'
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    const totalLogs = await AuditLog.countDocuments();
    const successLogs = await AuditLog.countDocuments({ status: 'success' });
    const failedLogs = await AuditLog.countDocuments({ status: 'failed' });

    res.status(200).json({
      success: true,
      data: {
        totalLogs,
        successLogs,
        failedLogs,
        activityBreakdown: stats
      }
    });
  } catch (error) {
    console.error('Error fetching audit log stats:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil statistik audit log',
      error: error.message
    });
  }
});

export default router;
