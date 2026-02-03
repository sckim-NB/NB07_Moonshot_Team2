import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string(),

  // App
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform(Number),
  FRONTEND_URL: z.string().default('http://localhost:5173'),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),

  // Cloudinary (필수)
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),

  // File Upload
  MAX_FILE_SIZE: z.string().default('5242880').transform(Number), // 5MB
  MAX_DOCUMENT_SIZE: z.string().default('10485760').transform(Number), // 10MB

  // Google OAuth (필수)
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_CALLBACK_URL: z.string(),

  // Google Calendar (선택사항 - 나중에 구현)
  GOOGLE_CALENDAR_ID: z.string().optional(),

  // Email (선택사항 - 나중에 구현)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined)),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
});

export const env = envSchema.parse(process.env);
