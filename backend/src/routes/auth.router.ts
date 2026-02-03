import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import * as authController from '../controllers/auth.controller.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const router = Router();

// Rate Limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 15분에 5번까지
  message: { message: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
});

const refreshLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1분
  max: 10, // 1분에 10번까지
  message: { message: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: true,
});

router.post('/register', authLimiter, asyncHandler(authController.register));
router.post('/login', authLimiter, asyncHandler(authController.login));
router.post('/refresh', refreshLimiter, asyncHandler(authController.refresh));
router.get('/google', asyncHandler(authController.google));
router.get('/google/callback', asyncHandler(authController.googleCallback));

export default router;
