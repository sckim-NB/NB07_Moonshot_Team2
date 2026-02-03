import { Request, Response } from 'express';
import { env } from '../lib/env.js';
import { InvalidRequestError } from '../lib/errors.js';
import { loginSchema, registerSchema } from '../schemas/auth.schema.js';
import * as authService from '../services/auth.service.js';

// 회원가입
export const register = async (req: Request, res: Response): Promise<void> => {
  const validatedData = registerSchema.parse(req.body);
  const user = await authService.register(validatedData);
  res.status(201).json(user);
};

// 로그인
export const login = async (req: Request, res: Response): Promise<void> => {
  const validatedData = loginSchema.parse(req.body);
  const tokens = await authService.login(validatedData);
  res.status(200).json(tokens);
};

// 토큰 갱신
export const refresh = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new InvalidRequestError();
  }

  const refreshToken = authHeader.substring(7);
  const tokens = await authService.refreshTokens(refreshToken);
  res.status(200).json(tokens);
};

// Google OAuth 시작
export const google = async (_req: Request, res: Response): Promise<void> => {
  const { url } = authService.initiateGoogleOAuth();
  res.redirect(307, url);
};

// Google OAuth 콜백
export const googleCallback = async (req: Request, res: Response): Promise<void> => {
  const code = req.query.code as string;

  if (!code) {
    throw new InvalidRequestError();
  }

  try {
    const tokens = await authService.handleGoogleCallback(code);
    const redirectUrl = `${env.FRONTEND_URL}?accessToken=${tokens.accessToken}&refreshToken=${tokens.refreshToken}`;
    res.redirect(307, redirectUrl);
  } catch {
    // 에러 발생 시 프론트엔드로 에러 전달
    // 상세 에러는 서버 로그에서 확인
    const errorRedirectUrl = `${env.FRONTEND_URL}?error=oauth_failed`;
    res.redirect(307, errorRedirectUrl);
  }
};
