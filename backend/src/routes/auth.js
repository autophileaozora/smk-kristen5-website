import express from 'express';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';
import { protect } from '../middleware/auth.js';
import { validateLogin, validateChangePassword, validateUpdateProfile } from '../middleware/validate.js';

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login user and get JWT token
 * @access  Public
 */
router.post('/login', validateLogin, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email (include password for comparison)
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Check if user is active
  if (!user.isActive) {
    res.status(403);
    throw new Error('Account is deactivated. Contact administrator.');
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Log login action
  await AuditLog.create({
    user: user._id,
    action: 'login',
    resource: 'user',
    resourceId: user._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    status: 'success',
  });

  // Generate JWT token
  const token = user.generateToken();

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
      },
      token,
    },
  });
}));

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user (client should delete token)
 * @access  Private
 */
router.post('/logout', protect, asyncHandler(async (req, res) => {
  // Log logout action
  await AuditLog.create({
    user: req.user._id,
    action: 'logout',
    resource: 'user',
    resourceId: req.user._id,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    status: 'success',
  });

  res.status(200).json({
    success: true,
    message: 'Logout successful',
  });
}));

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged in user
 * @access  Private
 */
router.get('/me', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    },
  });
}));

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile (name, email)
 * @access  Private
 */
router.put('/profile', protect, validateUpdateProfile, asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  const user = await User.findById(req.user._id);

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

  // Update fields
  user.name = name || user.name;
  user.email = email || user.email;

  await user.save();

  // Log update action
  await AuditLog.create({
    user: req.user._id,
    action: 'update',
    resource: 'user',
    resourceId: user._id,
    details: { updatedFields: ['name', 'email'] },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    status: 'success',
  });

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
}));

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', protect, validateChangePassword, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Verify current password
  const isPasswordValid = await user.comparePassword(currentPassword);

  if (!isPasswordValid) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Log password change
  await AuditLog.create({
    user: req.user._id,
    action: 'update',
    resource: 'user',
    resourceId: user._id,
    details: { action: 'password_change' },
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    status: 'success',
  });

  res.status(200).json({
    success: true,
    message: 'Password changed successfully',
  });
}));

export default router;
