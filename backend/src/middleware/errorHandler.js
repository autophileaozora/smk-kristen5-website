/**
 * Global error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Set status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    // Additional error details for development
    ...(process.env.NODE_ENV === 'development' && {
      path: req.path,
      method: req.method,
    }),
  });
};

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * MongoDB duplicate key error handler
 */
const handleDuplicateKeyError = (err, res) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  
  res.status(400).json({
    success: false,
    message: `${field.charAt(0).toUpperCase() + field.slice(1)} '${value}' already exists. Please use a different value.`,
  });
};

/**
 * MongoDB validation error handler
 */
const handleValidationError = (err, res) => {
  const errors = Object.values(err.errors).map(e => e.message);
  
  res.status(400).json({
    success: false,
    message: 'Validation failed',
    errors: errors,
  });
};

/**
 * Enhanced error handler with specific error type handling
 */
const enhancedErrorHandler = (err, req, res, next) => {
  // MongoDB duplicate key error
  if (err.code === 11000) {
    return handleDuplicateKeyError(err, res);
  }
  
  // MongoDB validation error
  if (err.name === 'ValidationError') {
    return handleValidationError(err, res);
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401);
    return res.json({
      success: false,
      message: 'Invalid token. Please log in again.',
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    res.status(401);
    return res.json({
      success: false,
      message: 'Token expired. Please log in again.',
    });
  }
  
  // Cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    res.status(400);
    return res.json({
      success: false,
      message: 'Invalid ID format',
    });
  }
  
  // Default error handler
  errorHandler(err, req, res, next);
};

export { errorHandler, notFound, enhancedErrorHandler };
export default { errorHandler, notFound, enhancedErrorHandler };
