import { Request, Response, Router } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '../lib/env.js';
import { InvalidRequestError } from '../lib/errors.js';
import { loginSchema, registerSchema } from '../schemas/auth.schema.js';
import * as authService from '../services/auth.service.js';
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

router.post(
  '/register',
  authLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    // Zod 검증
    const validatedData = registerSchema.parse(req.body);

    // 회원가입 처리
    const user = await authService.register(validatedData);

    res.status(201).json(user);
  })
);

router.post(
  '/login',
  authLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    // Zod 검증
    const validatedData = loginSchema.parse(req.body);

    // 로그인 처리
    const tokens = await authService.login(validatedData);

    res.status(200).json(tokens);
  })
);

router.post(
  '/refresh',
  refreshLimiter,
  asyncHandler(async (req: Request, res: Response) => {
    // Authorization 헤더에서 refreshToken 추출
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new InvalidRequestError();
    }

    const refreshToken = authHeader.substring(7);

    // 토큰 갱신
    const tokens = await authService.refreshTokens(refreshToken);

    res.status(200).json(tokens);
  })
);

router.get(
  '/google',
  asyncHandler(async (_req: Request, res: Response) => {
    const { url } = authService.initiateGoogleOAuth();

    // Google OAuth URL로 리다이렉트
    res.redirect(307, url);
  })
);

router.get(
  '/google/callback',
  asyncHandler(async (req: Request, res: Response) => {
    const code = req.query.code as string;

    if (!code) {
      throw new InvalidRequestError();
    }

    try {
      // 구글 OAuth 처리
      const tokens = await authService.handleGoogleCallback(code);

      // 프론트엔드로 토큰과 함께 리다이렉트
      const redirectUrl = `${env.FRONTEND_URL}?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`;
      res.redirect(307, redirectUrl);
    } catch (error) {
      console.error('Google OAuth Error:', error);
      // 에러 발생 시 프론트엔드로 에러 전달
      const errorRedirectUrl = `${env.FRONTEND_URL}?error=oauth_failed`;
      res.redirect(307, errorRedirectUrl);
    }
  })
);

export default router;
