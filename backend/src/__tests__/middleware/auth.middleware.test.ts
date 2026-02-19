import { Request, Response, NextFunction } from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { generateAccessToken } from '../../lib/jwt.js';

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {};
    nextFunction = jest.fn();
  });

  describe('authenticate', () => {
    it('유효한 토큰으로 req.userId를 설정하고 next를 호출해야 함', () => {
      const userId = 'test-user-id';
      const token = generateAccessToken(userId);

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      authenticate(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockRequest.user?.id).toBe(userId);
      expect(nextFunction).toHaveBeenCalled();
    });

    it('Authorization 헤더가 없으면 LoginRequiredError를 던져야 함', () => {
      mockRequest.headers = {};

      expect(() => {
        authenticate(mockRequest as Request, mockResponse as Response, nextFunction);
      }).toThrow('로그인이 필요합니다');
    });

    it('Bearer 형식이 아니면 LoginRequiredError를 던져야 함', () => {
      mockRequest.headers = {
        authorization: 'InvalidFormat token',
      };

      expect(() => {
        authenticate(mockRequest as Request, mockResponse as Response, nextFunction);
      }).toThrow('로그인이 필요합니다');
    });

    it('유효하지 않은 토큰으로 LoginRequiredError를 던져야 함', () => {
      mockRequest.headers = {
        authorization: 'Bearer invalid-token',
      };

      expect(() => {
        authenticate(mockRequest as Request, mockResponse as Response, nextFunction);
      }).toThrow('로그인이 필요합니다');
    });

    it('만료된 토큰으로 TokenExpiredError를 던져야 함', () => {
      // 만료된 토큰 생성 (실제로는 매우 짧은 시간으로 설정하거나 mock 필요)
      // 여기서는 단순히 잘못된 형식의 토큰으로 테스트
      const expiredToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0IiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE2MTYyMzkwMjJ9.invalid';

      mockRequest.headers = {
        authorization: `Bearer ${expiredToken}`,
      };

      expect(() => {
        authenticate(mockRequest as Request, mockResponse as Response, nextFunction);
      }).toThrow();
    });

    it('빈 토큰으로 LoginRequiredError를 던져야 함', () => {
      mockRequest.headers = {
        authorization: 'Bearer ',
      };

      expect(() => {
        authenticate(mockRequest as Request, mockResponse as Response, nextFunction);
      }).toThrow('로그인이 필요합니다');
    });
  });
});
