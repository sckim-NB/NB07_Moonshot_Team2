import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorMiddleware } from './middleware/error.middleware.js';
import { env } from './lib/env.js';
import authRouter from './routes/auth.router.js';
import userRouter from './routes/user.router.js';
import memberRouter from './routes/member.routes.js';
import projectRouter from './routes/project.router.js';
import taskRouter from './routes/task.router.js';
import subtaskRouter from './routes/subtask.routes.js';
import commentRouter from './routes/comment.router.js';
import fileRouter from './routes/file.router.js';
import path from 'path';
import cookieParser from 'cookie-parser';

const app = express();
app.use(cookieParser());
// CORS 설정
app.use(
  cors({
    origin: [
      env.FRONTEND_URL,
      'http://localhost:3001',
      'http://localhost:3000',
      'http://localhost:5173',
    ].filter(Boolean),
    credentials: true,
  })
);

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
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
app.use('/api/auth', authRouter);
app.use('/api/files', fileRouter);
app.use('/api/projects', projectRouter);
app.use('/api/users', userRouter);
app.use('/api', memberRouter);
app.use('/api', taskRouter);
app.use('/api', subtaskRouter);
app.use('/api', commentRouter);

// Error handler (마지막에 위치)
app.use(errorMiddleware);

export default app;
