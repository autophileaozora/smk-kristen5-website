import mongoose from 'mongoose';
import app from '../src/app.js';

// Connect MongoDB — non-blocking, no dotenv (Vercel inject env vars langsung)
if (process.env.MONGODB_URI && mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: 1,
    serverSelectionTimeoutMS: 5000,
  }).catch(err => console.error('MongoDB error:', err.message));
}

export default app;
