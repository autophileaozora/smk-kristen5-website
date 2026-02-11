import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import { enhancedErrorHandler, notFound } from './middleware/errorHandler.js';
import logger from './utils/logger.js';

const app = express();

// Security Middleware
app.use(helmet()); // Set security headers
app.use(mongoSanitize()); // Prevent MongoDB injection

// CORS Configuration - Allow multiple origins
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000'
];

// Add production frontend URL if exists
if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Rate Limiting - Prevent brute force attacks
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 for dev, 100 for prod
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all routes
app.use('/api/', limiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Max 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again after 15 minutes.',
});

// Body Parser Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request Logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// API Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import articleRoutes from './routes/articles.js';
import categoryRoutes from './routes/categories.js';
import runningTextRoutes from './routes/runningText.js';
import prestasiRoutes from './routes/prestasi.js';
import jurusanRoutes from './routes/jurusan.js';
import ekskulRoutes from './routes/ekskul.js';
import alumniRoutes from './routes/alumni.js';
import videoHeroRoutes from './routes/videoHero.js';
import dashboardRoutes from './routes/dashboard.js';
import mataPelajaranRoutes from './routes/mataPelajaran.js';
import fasilitasRoutes from './routes/fasilitas.js';
import contactRoutes from './routes/contact.js';
import auditLogRoutes from './routes/auditLogs.js';
import uploadRoutes from './routes/upload.js';
import socialMediaRoutes from './routes/socialMedia.js';
import partnerRoutes from './routes/partner.js';
import ctaRoutes from './routes/cta.js';
import aboutRoutes from './routes/about.js';
import heroSlidesRoutes from './routes/heroSlides.js';
import activitiesRoutes from './routes/activities.js';
import eventsRoutes from './routes/events.js';
import customPagesRoutes from './routes/customPages.js';
import siteSettingsRoutes from './routes/siteSettings.js';
import navbarRoutes from './routes/navbar.js';
import footerRoutes from './routes/footer.js';

// Mount routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/running-text', runningTextRoutes);
app.use('/api/prestasi', prestasiRoutes);
app.use('/api/jurusan', jurusanRoutes);
app.use('/api/ekskul', ekskulRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/video-hero', videoHeroRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/mata-pelajaran', mataPelajaranRoutes);
app.use('/api/fasilitas', fasilitasRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/social-media', socialMediaRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/cta', ctaRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/hero-slides', heroSlidesRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/custom-pages', customPagesRoutes);
app.use('/api/site-settings', siteSettingsRoutes);
app.use('/api/navbar', navbarRoutes);
app.use('/api/footer', footerRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SMK Kristen 5 Klaten API',
    version: '1.0.0',
    documentation: '/api/docs', // Will add API docs later
  });
});

// 404 Not Found Handler
app.use(notFound);

// Global Error Handler (must be last)
app.use(enhancedErrorHandler);

export default app;
