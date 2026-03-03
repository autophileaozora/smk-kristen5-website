import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import express from 'express';

// Koneksi MongoDB khusus serverless — tanpa process.exit()
if (mongoose.connection.readyState === 0) {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 1,              // Minimal untuk serverless
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // Tidak process.exit() — biarkan Express handle error via middleware
  }
}

// Import app setelah MongoDB setup
let app;
try {
  const module = await import('../src/app.js');
  app = module.default;
  console.log('✅ Express app loaded');
} catch (initError) {
  console.error('❌ FATAL: Failed to load Express app:', initError.message);
  console.error(initError.stack);
  // Fallback: return the actual error so we can diagnose it
  app = express();
  app.use((req, res) => {
    res.status(500).json({
      success: false,
      error: 'App initialization failed',
      message: initError.message,
      stack: initError.stack,
    });
  });
}

export default app;
