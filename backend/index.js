import dotenv from 'dotenv';
import app from './src/app.js';
import connectDB from './src/config/database.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB (akan auto-cache connection di serverless)
connectDB();

// Export app untuk Vercel
export default app;
