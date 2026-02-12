import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorMiddleware } from './middleware/error.middleware.js';
import { env } from './lib/env.js';
import authRouter from './routes/auth.router.js';

import memberRouter from './routes/member.routes.js';

import projectRouter from './routes/project.router.js';

const app = express();

// CORS 설정
app.use(
  cors({
    origin: env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Body Parser (DoS 방지를 위한 크기 제한)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/auth', authRouter);
// app.use('/files', fileRouter);
app.use(memberRouter);
app.use('/projects', projectRouter);
// Error handler (마지막에 위치)
app.use(errorMiddleware);

export default app;
