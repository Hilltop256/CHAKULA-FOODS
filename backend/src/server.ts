import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { env, validateEnv } from './config/env';
import { logger } from './config/logger';
import { errorHandler, notFound } from './middleware/errorHandler';

// Routes
import authRoutes from './routes/authRoutes';
import productRoutes from './routes/productRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';
import tableRoutes from './routes/tableRoutes';
import reservationRoutes from './routes/reservationRoutes';
import customMealRoutes from './routes/customMealRoutes';
import adminRoutes from './routes/adminRoutes';

validateEnv();

const app = express();

// ========================
// MIDDLEWARE
// ========================

app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many authentication attempts, please try again later' },
});

app.use('/api', limiter);
app.use('/api/auth', authLimiter);

// Static uploads
app.use('/uploads', express.static(path.join(process.cwd(), env.UPLOAD_DIR)));

// ========================
// ROUTES
// ========================

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/custom-meals', customMealRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'CHAKULA-FOODS API is running',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ========================
// ERROR HANDLING
// ========================

app.use(notFound);
app.use(errorHandler);

// ========================
// START SERVER
// ========================

const server = app.listen(env.PORT, () => {
  logger.info(`🍽️  CHAKULA-FOODS API running on port ${env.PORT} [${env.NODE_ENV}]`);
  logger.info(`📖  Health check: http://localhost:${env.PORT}/api/health`);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
  server.close(() => process.exit(1));
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down...');
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

export default app;
