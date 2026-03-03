import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from '../src/app.js';

// Connect to MongoDB non-blocking — jangan pakai await
// agar function bisa respond request tanpa harus tunggu koneksi selesai
if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: 1,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 30000,
  }).then(() => {
    console.log('✅ MongoDB Connected');
  }).catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
  });
}

export default app;
