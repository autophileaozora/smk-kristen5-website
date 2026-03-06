import mongoose from 'mongoose';
import app from '../src/app.js';

// Disable Mongoose command buffering — fail fast instead of waiting 10s
mongoose.set('bufferCommands', false);

let connectionPromise = null;

// Listen for connection drops so we force a reconnect on next request
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected — resetting connection cache');
  connectionPromise = null;
});
mongoose.connection.on('error', () => {
  connectionPromise = null;
});

const ensureConnected = () => {
  // readyState: 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (connectionPromise) return connectionPromise;

  connectionPromise = mongoose
    .connect(process.env.MONGODB_URI, {
      maxPoolSize: 1,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 8000,
      socketTimeoutMS: 10000,
      connectTimeoutMS: 8000,
      heartbeatFrequencyMS: 10000,
    })
    .then(() => {
      // Do NOT cache the resolved promise — keep checking readyState on each request
      // so a future disconnection is properly detected
      connectionPromise = null;
    })
    .catch((err) => {
      connectionPromise = null;
      console.error('MongoDB connect error:', err.message);
      throw err;
    });

  return connectionPromise;
};

export default async function handler(req, res) {
  try {
    await ensureConnected();
  } catch {
    return res.status(503).json({
      success: false,
      message: 'Database tidak tersedia, coba lagi dalam beberapa detik.',
    });
  }
  return app(req, res);
}
