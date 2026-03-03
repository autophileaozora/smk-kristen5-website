import dotenv from 'dotenv';
dotenv.config();

import connectDB from '../src/config/database.js';
import app from '../src/app.js';

// Koneksi MongoDB (cached — tidak reconnect setiap request)
await connectDB();

export default app;
