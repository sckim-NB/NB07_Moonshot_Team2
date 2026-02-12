import { Request, Response, NextFunction } from 'express';
import { errorMiddleware } from '../../middleware/error.middleware.js';
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  EmailAlreadyExistsError,
  TokenExpiredError,
  InvalidCredentialsError,
} from '../../lib/errors.js';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

describe('에러 미들웨어', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });
    mockReq = {};
    mockRes = {
      status: statusMock,
    };
    mockNext = jest.fn();

    // console.error 모킹
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('AppError 처리', () => {
    it('BadRequestError를 올바른 형식으로 반환해야 함', () => {
      const error = new BadRequestError('잘못된 요청');

      errorMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: '잘못된 요청',
      });
    });

    it('UnauthorizedError를 올바른 형식으로 반환해야 함', () => {
      const error = new UnauthorizedError('인증 실패');

      errorMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        message: '인증 실패',
      });
    });

    it('NotFoundError를 올바른 형식으로 반환해야 함', () => {
      const error = new NotFoundError('리소스를 찾을 수 없습니다');

      errorMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        message: '리소스를 찾을 수 없습니다',
      });
    });
  });

  describe('구체적 에러 클래스 처리', () => {
    it('EmailAlreadyExistsError를 처리해야 함', () => {
      const error = new EmailAlreadyExistsError();

      errorMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: '이미 가입한 이메일입니다.',
      });
    });

    it('TokenExpiredError를 처리해야 함', () => {
      const error = new TokenExpiredError();

      errorMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        message: '토큰 만료',
      });
    });

    it('InvalidCredentialsError를 처리해야 함', () => {
      const error = new InvalidCredentialsError();

      errorMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        message: '존재하지 않거나 비밀번호가 일치하지 않습니다',
      });
    });
  });

  describe('ZodError 처리', () => {
    it('ZodError에 대해 한글 메시지를 반환해야 함', () => {
      const error = new ZodError([
        {
          code: 'invalid_type',
          expected: 'string',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          received: 'number' as any,
          path: ['email'],
          message: 'Expected string, received number',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      ]);

      errorMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: '잘못된 요청 형식',
      });
    });
  });

  describe('Prisma 에러 처리', () => {
    it('Prisma unique constraint 위반 (P2002)을 처리해야 함', () => {
      const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.0.0',
        meta: { target: ['email'] },
      });

      errorMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(409);
      expect(jsonMock).toHaveBeenCalledWith({
        message: '이미 존재하는 데이터입니다',
      });
    });

    it('Prisma foreign key constraint 위반 (P2003)을 처리해야 함', () => {
      const error = new Prisma.PrismaClientKnownRequestError('Foreign key constraint failed', {
        code: 'P2003',
        clientVersion: '5.0.0',
      });

      errorMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: '잘못된 데이터 형식',
      });
    });

    it('Prisma 레코드를 찾을 수 없음 (P2025)을 처리해야 함', () => {
      const error = new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: '5.0.0',
      });

      errorMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        message: '존재하지 않는 리소스입니다',
      });
    });

    it('Prisma 유효성 검증 에러를 처리해야 함', () => {
      const error = new Prisma.PrismaClientValidationError('Validation failed', {
        clientVersion: '5.0.0',
      });

      errorMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: '잘못된 데이터 형식',
      });
    });
  });

  describe('기본 에러 처리', () => {
    it('프로덕션 환경에서는 일반 메시지를 반환해야 함', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const error = new Error('Internal error details');

      errorMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: '서버 오류가 발생했습니다',
      });

      process.env.NODE_ENV = originalEnv;
    });

    it('개발 환경에서는 상세 메시지를 반환해야 함', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const error = new Error('Detailed error message');

      errorMiddleware(error, mockReq as Request, mockRes as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Detailed error message',
          stack: expect.any(String),
        })
      );

      process.env.NODE_ENV = originalEnv;
    });
  });
});
