import { NextFunction, Request, Response } from 'express';
import { LoginRequiredError, TokenExpiredError } from '../lib/errors.js';
import { verifyAccessToken } from '../lib/jwt.js';
import { User } from '@prisma/client';

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // Authorization 헤더 확인
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new LoginRequiredError();
  }

  // Bearer 토큰 추출
  const token = authHeader.substring(7);

  // 토큰 검증
  const result = verifyAccessToken(token);

  if (!result.valid) {
    if (result.expired) {
      throw new TokenExpiredError();
    }
    throw new LoginRequiredError();
  }

  // req.userId 설정
  req.user = {
    id: result.payload!.userId,
  } as User;

  next();
};
