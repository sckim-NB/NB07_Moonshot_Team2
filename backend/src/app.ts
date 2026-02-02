import express from 'express';
import cors from 'cors';
import { errorMiddleware } from './middleware/error.middleware.js';
import { env } from './lib/env.js';

import memberRouter from './routes/member.routes.js';

const app = express();

// CORS 설정
app.use(
  cors({
    origin: env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
// app.use('/auth', authRouter);
// app.use('/files', fileRouter);
app.use(memberRouter);

// Error handler (마지막에 위치)
app.use(errorMiddleware);

export default app;
