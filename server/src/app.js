import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import errorHandler from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import plantRoutes from './routes/plant.routes.js';
import aiRoutes from './routes/ai.routes.js';
import chatRoutes from './routes/chat.routes.js';
import weatherRoutes from './routes/weather.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import reportRoutes from './routes/report.routes.js';
import growthRoutes from './routes/growth.routes.js';
import diseaseRoutes from './routes/disease.routes.js';
import adminRoutes from './routes/admin.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import outbreakRoutes from './routes/outbreak.routes.js';

const app = express();

// ─── Security Middleware ─────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// ─── CORS ────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Rate Limiting ───────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// AI routes get a separate, more generous limiter
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'AI rate limit reached. Please try again later.' },
});
app.use('/api/ai/', aiLimiter);

// ─── Body Parsers ────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ─── Health Check ────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'PlantSense AI Server is running 🌿', timestamp: new Date().toISOString() });
});

// ─── API Routes ──────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/plants', plantRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/growth', growthRoutes);
app.use('/api/diseases', diseaseRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/outbreaks', outbreakRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found.` });
});

// ─── Error Handler ───────────────────────────────────────────────────
app.use(errorHandler);

export default app;
