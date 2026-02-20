import express from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { protect } from '../middleware/auth.js';
import { isAdministrator } from '../middleware/roleCheck.js';
import { validateCreateUser } from '../middleware/validate.js';

const router = express.Router();

// All routes require authentication and administrator role
router.use(protect, isAdministrator);

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination and filters
 * @access  Private (Administrator only)
 */
router.get('/', asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Filters
  const filters = {};
  
  if (req.query.role) {
    filters.role = req.query.role;
  }
  
  if (req.query.isActive !== undefined) {
    filters.isActive = req.query.isActive === 'true';
  }

  if (req.query.search) {
    filters.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  // Get users
  const users = await User.find(filters)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await User.countDocuments(filters);

  res.status(200).json({
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    },
  });
}));

/**
 * @route   GET /api/users/:id
 * @desc    Get single user by ID
 * @access  Private (Administrator only)
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.status(200).json({
    success: true,
    data: { user },
  });
}));

/**
 * @route   POST /api/users
 * @desc    Create new user (Admin Siswa or Administrator)
 * @access  Private (Administrator only)
 */
router.post('/', validateCreateUser, asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validation
  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error('Please provide name, email, password, and role');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  if (!['administrator', 'admin_siswa'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role. Must be administrator or admin_siswa');
  }

  // Check if email already exists
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    res.status(400);
    throw new Error('Email already in use');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  // Log creation
  await AuditLog.create({
    user: req.user._id,
    action: 'create',
    resource: 'user',
    resourceId: user._id,
    details: {
      createdUser: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    status: 'success',
  });

  res.status(201).json({
    success: true,
    message: 'User created successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    },
  });
}));

/**
 * @route   PUT /api/users/:id
 * @desc    Update user
 * @access  Private (Administrator only)
 */
router.put('/:id', asyncHandler(async (req, res) => {
  const { name, email, role, isActive } = req.body;

  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if email is being changed and already exists
  if (email && email !== user.email) {
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already in use');
    }
  }

  // Validate role if provided
  if (role && !['administrator', 'admin_siswa'].includes(role)) {
    res.status(400);
    throw new Error('Invalid role');
  }

  // Update fields
  const updatedFields = [];
  if (name) {
    user.name = name;
    updatedFields.push('name');
  }
  if (email) {
    user.email = email;
    updatedFields.push('email');
  }
  if (role) {
    user.role = role;
    updatedFields.push('role');
  }
  if (isActive !== undefined) {
    user.isActive = isActive;
    updatedFields.push('isActive');
  }

  await user.save();

  // Log update
  await AuditLog.create({
    user: req.user._id,
    action: 'update',
    resource: 'user',
    resourceId: user._id,
    details: { updatedFields },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    status: 'success',
  });

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    },
  });
}));

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Private (Administrator only)
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent deleting yourself
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot delete your own account');
  }

  await user.deleteOne();

  // Log deletion
  await AuditLog.create({
    user: req.user._id,
    action: 'delete',
    resource: 'user',
    resourceId: user._id,
    details: {
      deletedUser: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    status: 'success',
  });

  res.status(200).json({
    success: true,
    message: 'User deleted successfully',
  });
}));

/**
 * @route   PATCH /api/users/:id/activate
 * @desc    Activate user account
 * @access  Private (Administrator only)
 */
router.patch('/:id/activate', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.isActive = true;
  await user.save();

  // Log activation
  await AuditLog.create({
    user: req.user._id,
    action: 'update',
    resource: 'user',
    resourceId: user._id,
    details: { action: 'account_activated' },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    status: 'success',
  });

  res.status(200).json({
    success: true,
    message: 'User account activated',
    data: { user },
  });
}));

/**
 * @route   PATCH /api/users/:id/deactivate
 * @desc    Deactivate user account
 * @access  Private (Administrator only)
 */
router.patch('/:id/deactivate', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent deactivating yourself
  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot deactivate your own account');
  }

  user.isActive = false;
  await user.save();

  // Log deactivation
  await AuditLog.create({
    user: req.user._id,
    action: 'update',
    resource: 'user',
    resourceId: user._id,
    details: { action: 'account_deactivated' },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    status: 'success',
  });

  res.status(200).json({
    success: true,
    message: 'User account deactivated',
    data: { user },
  });
}));

export default router;
