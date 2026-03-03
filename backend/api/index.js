import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from '../src/app.js';

// Koneksi MongoDB khusus serverless — tanpa process.exit()
if (mongoose.connection.readyState === 0) {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 1,              // Minimal untuk serverless
      serverSelectionTimeoutMS: 10000, // 10 detik (cold start lebih lambat)
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // Tidak process.exit() — biarkan Express handle error via middleware
  }
}

export default app;
