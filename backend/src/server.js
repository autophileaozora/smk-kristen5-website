import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables FIRST before any other imports
// Specify path explicitly to make sure it loads from backend root
dotenv.config({ path: path.join(__dirname, '..', '.env') });

import app from './app.js';
import connectDB from './config/database.js';
import logger from './utils/logger.js';

// Validate required environment variables
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'FRONTEND_URL',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !process.env[envVar]
);

if (missingEnvVars.length > 0) {
  console.error(
    `❌ Missing required environment variables: ${missingEnvVars.join(', ')}`
  );
  console.error('Please check your .env file');
  process.exit(1);
}

// Connect to MongoDB
connectDB();

// Server configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Start server
const server = app.listen(PORT, () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Server running in ${NODE_ENV} mode`);
  console.log(`🚀 Server listening on port ${PORT}`);
  console.log(`📡 Base URL: http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  logger.info(`Server started on port ${PORT} in ${NODE_ENV} mode`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  logger.error('Unhandled Promise Rejection', { error: err });
  
  // Close server & exit process
  server.close(() => {
    console.error('💥 Server closed due to unhandled rejection');
    process.exit(1);
  });
});

// Handle SIGTERM signal (graceful shutdown)
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM signal received: closing HTTP server');
  logger.info('SIGTERM signal received');
  
  server.close(() => {
    console.log('💤 HTTP server closed');
    logger.info('Server shutdown complete');
    process.exit(0);
  });
});

// Handle SIGINT signal (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n👋 SIGINT signal received: closing HTTP server');
  logger.info('SIGINT signal received');
  
  server.close(() => {
    console.log('💤 HTTP server closed');
    logger.info('Server shutdown complete');
    process.exit(0);
  });
});

export default server;
