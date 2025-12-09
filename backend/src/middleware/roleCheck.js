import asyncHandler from 'express-async-handler';

/**
 * Check if user is Administrator
 */
export const isAdministrator = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'administrator') {
    next();
  } else {
    res.status(403);
    throw new Error('Access denied. Administrator privileges required.');
  }
});

/**
 * Check if user is Admin Siswa
 */
export const isAdminSiswa = asyncHandler(async (req, res, next) => {
  if (req.user && req.user.role === 'admin_siswa') {
    next();
  } else {
    res.status(403);
    throw new Error('Access denied. Admin Siswa privileges required.');
  }
});

/**
 * Check if user is either Administrator or Admin Siswa
 */
export const isAdminOrAdminSiswa = asyncHandler(async (req, res, next) => {
  if (req.user && (req.user.role === 'administrator' || req.user.role === 'admin_siswa')) {
    next();
  } else {
    res.status(403);
    throw new Error('Access denied. Admin privileges required.');
  }
});

/**
 * Check if user can edit content
 * - Administrator: can edit any content
 * - Admin Siswa: can only edit own content that is NOT published
 */
export const canEditContent = (contentModel) => {
  return asyncHandler(async (req, res, next) => {
    const contentId = req.params.id;
    const content = await contentModel.findById(contentId);

    if (!content) {
      res.status(404);
      throw new Error('Content not found');
    }

    // Administrator can edit anything
    if (req.user.role === 'administrator') {
      req.content = content; // Attach content to request
      return next();
    }

    // Admin Siswa can only edit own draft/pending/rejected content
    if (req.user.role === 'admin_siswa') {
      // Check if user is the author
      if (content.author.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('You can only edit your own content');
      }

      // Check if content is published
      if (content.status === 'published') {
        res.status(403);
        throw new Error('Cannot edit published content. Contact administrator for changes.');
      }

      req.content = content;
      return next();
    }

    res.status(403);
    throw new Error('Access denied');
  });
};

/**
 * Check if user can delete content
 * - Administrator: can delete any content
 * - Admin Siswa: CANNOT delete anything
 */
export const canDeleteContent = (contentModel) => {
  return asyncHandler(async (req, res, next) => {
    const contentId = req.params.id;
    const content = await contentModel.findById(contentId);

    if (!content) {
      res.status(404);
      throw new Error('Content not found');
    }

    // Only Administrator can delete
    if (req.user.role === 'administrator') {
      req.content = content;
      return next();
    }

    res.status(403);
    throw new Error('Only Administrator can delete content');
  });
};

export default {
  isAdministrator,
  isAdminSiswa,
  isAdminOrAdminSiswa,
  canEditContent,
  canDeleteContent,
};
