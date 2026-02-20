import { validationResult, body, query } from 'express-validator';

/**
 * Run validation results and return 400 if any errors.
 */
export const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array().map(e => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

/**
 * Auth: Login
 */
export const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email wajib diisi')
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password wajib diisi'),
  handleValidation,
];

/**
 * Auth: Change password
 */
export const validateChangePassword = [
  body('currentPassword')
    .notEmpty().withMessage('Password saat ini wajib diisi'),
  body('newPassword')
    .notEmpty().withMessage('Password baru wajib diisi')
    .isLength({ min: 8 }).withMessage('Password minimal 8 karakter')
    .matches(/[A-Za-z]/).withMessage('Password harus mengandung huruf')
    .matches(/[0-9]/).withMessage('Password harus mengandung angka'),
  handleValidation,
];

/**
 * Auth: Update profile
 */
export const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Nama harus 2-100 karakter'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),
  handleValidation,
];

/**
 * User: Create/Update user (admin)
 */
export const validateCreateUser = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nama wajib diisi')
    .isLength({ min: 2, max: 100 }).withMessage('Nama harus 2-100 karakter'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email wajib diisi')
    .isEmail().withMessage('Format email tidak valid')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password wajib diisi')
    .isLength({ min: 8 }).withMessage('Password minimal 8 karakter')
    .matches(/[A-Za-z]/).withMessage('Password harus mengandung huruf')
    .matches(/[0-9]/).withMessage('Password harus mengandung angka'),
  body('role')
    .optional()
    .isIn(['administrator', 'admin_siswa']).withMessage('Role tidak valid'),
  handleValidation,
];

/**
 * Pagination query params sanitizer
 */
export const sanitizePagination = [
  query('page')
    .optional()
    .toInt()
    .isInt({ min: 1 }).withMessage('Page harus bilangan bulat positif')
    .default(1),
  query('limit')
    .optional()
    .toInt()
    .isInt({ min: 1, max: 100 }).withMessage('Limit harus antara 1-100')
    .default(10),
  handleValidation,
];
