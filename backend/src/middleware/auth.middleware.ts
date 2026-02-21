import { NextFunction, Request, Response } from 'express';
import { LoginRequiredError, TokenExpiredError } from '../lib/errors.js';
import { verifyAccessToken } from '../lib/jwt.js';
import { User } from '@prisma/client';

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  let token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  // 2. [추가] 헤더에 없다면 쿠키에서 추출 시도
  if (!token && req.cookies) {
    token = req.cookies['access-token'];
  }

  // 토큰이 아예 없는 경우
  if (!token) {
    throw new LoginRequiredError();
  }

  // 토큰 검증 로직 (기존과 동일)
  const result = verifyAccessToken(token);
  if (!result.valid) {
    if (result.expired) {
      throw new TokenExpiredError();
    }
    throw new LoginRequiredError();
  }

  req.user = {
    id: result.payload!.userId,
  } as User;

  next();
};
