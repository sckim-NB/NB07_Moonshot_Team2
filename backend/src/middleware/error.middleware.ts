import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors.js';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export const errorMiddleware = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);

  // AppError (커스텀 에러)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  // Zod Validation Error
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: '잘못된 요청 형식',
    });
  }

  // Prisma Known Request Error
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (err.code === 'P2002') {
      return res.status(409).json({
        message: '이미 존재하는 데이터입니다',
      });
    }

    // Foreign key constraint violation
    if (err.code === 'P2003') {
      return res.status(400).json({
        message: '잘못된 데이터 형식',
      });
    }

    // Record not found
    if (err.code === 'P2025') {
      return res.status(404).json({
        message: '존재하지 않는 리소스입니다',
      });
    }
  }

  // Prisma Validation Error
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      message: '잘못된 데이터 형식',
    });
  }

  // Default Error (500)
  return res.status(500).json({
    message: process.env.NODE_ENV === 'production' ? '서버 오류가 발생했습니다' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};
