import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import { env } from './config/env.config';
import { redisClient } from './config/redis.config';
import { requestLogger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';

import authRoutes from './modules/auth';
import userRoutes from './modules/user';
import { discoveryRoutes } from './modules/discovery';
import { waveRoutes } from './modules/wave';
import { chatRoutes } from './modules/chat';
import { sparkRoutes } from './modules/spark';
import { moderationRoutes } from './modules/moderation';
import { complimentRoutes } from './modules/compliment';

const app: Application = express();

// Security & Parsing Middleware
app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// API Routes (Supports both /api and /api/v1 prefixes)
const apiPrefixes = ['/api', '/api/v1'];
apiPrefixes.forEach((prefix) => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/users`, userRoutes);
  app.use(`${prefix}/discover`, discoveryRoutes);
  app.use(prefix, waveRoutes);
  app.use(prefix, chatRoutes);
  app.use(prefix, sparkRoutes);
  app.use(prefix, moderationRoutes);
  app.use(`${prefix}/compliments`, complimentRoutes);
});



// Health Check Route
app.get('/api/v1/health', async (_req: Request, res: Response) => {
  let redisStatus = 'disconnected';
  try {
    if (redisClient.isOpen) {
      const pingRes = await redisClient.ping();
      if (pingRes === 'PONG') redisStatus = 'connected';
    }
  } catch (err) {
    redisStatus = 'error';
  }

  const dbStateMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const mongoStatus = dbStateMap[mongoose.connection.readyState] || 'unknown';

  res.status(200).json({
    status: 'ok',
    appName: 'Echo Backend API',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    services: {
      database: mongoStatus,
      redis: redisStatus
    }
  });
});

// 404 Fallback Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: { message: 'Route not found' }
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
