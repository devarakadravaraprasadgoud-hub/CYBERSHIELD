import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import topicRoutes from './routes/topicRoutes.js';
import moduleRoutes from './routes/moduleRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import questionRoutes from './routes/questionRoutes.js';
import attemptRoutes from './routes/attemptRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import userRoutes from './routes/userRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import simulationRoutes from './routes/simulationRoutes.js';

// Models for public statistics
import { Topic } from './models/Topic.js';
import { LearningModule } from './models/LearningModule.js';
import { Quiz } from './models/Quiz.js';
import { User } from './models/User.js';
import { QuizAttempt } from './models/QuizAttempt.js';
import { sendSuccess } from './utils/apiResponse.js';

const app = express();

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// CORS configuration
const allowedOrigins = [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'];
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Dev-friendly fallback
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Global General Rate Limiter
app.use('/api', generalLimiter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  return sendSuccess(res, 'CyberShield API is fully operational', {
    status: 'healthy',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime())
  });
});

// Real Public Platform Statistics Endpoint (used by Landing page)
app.get('/api/public-stats', async (req, res, next) => {
  try {
    const [totalTopics, totalModules, totalQuizzes, totalLearners, totalAttempts] = await Promise.all([
      Topic.countDocuments({ isPublished: true }),
      LearningModule.countDocuments({ isPublished: true }),
      Quiz.countDocuments({ isPublished: true }),
      User.countDocuments({ role: 'learner' }),
      QuizAttempt.countDocuments({ status: 'completed' })
    ]);

    return sendSuccess(res, 'Platform statistics retrieved', {
      totalTopics,
      totalModules,
      totalQuizzes,
      totalLearners,
      totalAttempts
    });
  } catch (error) {
    next(error);
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/simulations', simulationRoutes);
app.use('/api/attack-simulations', simulationRoutes);

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
