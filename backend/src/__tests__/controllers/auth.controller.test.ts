import { Request, Response } from 'express';
import * as authController from '../../controllers/auth.controller.js';
import * as authService from '../../services/auth.service.js';

// 서비스 레이어 mock
jest.mock('../../services/auth.service.js', () => ({
  register: jest.fn(),
  login: jest.fn(),
  refreshTokens: jest.fn(),
  initiateGoogleOAuth: jest.fn(),
  handleGoogleCallback: jest.fn(),
}));

// env.FRONTEND_URL mock (Google OAuth 리다이렉트용)
jest.mock('../../lib/env.js', () => ({
  env: {
    FRONTEND_URL: 'http://frontend.test',
  },
}));

describe('Auth Controller', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      redirect: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('refresh', () => {
    it('Authorization 헤더가 없으면 InvalidRequestError를 던져야 함', async () => {
      mockReq.headers = {};

      await expect(authController.refresh(mockReq as Request, mockRes as Response)).rejects.toThrow(
        '잘못된 요청입니다'
      );
    });

    it('Bearer 형식이 아니면 InvalidRequestError를 던져야 함', async () => {
      mockReq.headers = {
        authorization: 'Invalid token',
      };

      await expect(authController.refresh(mockReq as Request, mockRes as Response)).rejects.toThrow(
        '잘못된 요청입니다'
      );
    });
  });

  describe('google', () => {
    it('Google OAuth URL로 307 리다이렉트해야 함', async () => {
      (authService.initiateGoogleOAuth as jest.Mock).mockReturnValue({ url: 'http://google.test' });

      await authController.google(mockReq as Request, mockRes as Response);

      expect(authService.initiateGoogleOAuth).toHaveBeenCalled();
      expect(mockRes.redirect).toHaveBeenCalledWith(307, 'http://google.test');
    });
  });

  describe('googleCallback', () => {
    it('code 쿼리가 없으면 InvalidRequestError를 던져야 함', async () => {
      mockReq.query = {};

      await expect(
        authController.googleCallback(mockReq as Request, mockRes as Response)
      ).rejects.toThrow('잘못된 요청입니다');
    });

    it('성공 시 토큰과 함께 FRONTEND_URL로 307 리다이렉트해야 함', async () => {
      (authService.handleGoogleCallback as jest.Mock).mockResolvedValue({
        accessToken: 'access',
        refreshToken: 'refresh',
      });

      mockReq.query = {
        code: 'test-code',
      };

      await authController.googleCallback(mockReq as Request, mockRes as Response);

      expect(authService.handleGoogleCallback).toHaveBeenCalledWith('test-code');
      expect(mockRes.redirect).toHaveBeenCalledWith(
        307,
        'http://frontend.test?accessToken=access&refreshToken=refresh'
      );
    });

    it('서비스에서 에러가 발생하면 oauth_failed 쿼리로 리다이렉트해야 함', async () => {
      (authService.handleGoogleCallback as jest.Mock).mockRejectedValue(new Error('OAuth error'));

      mockReq.query = {
        code: 'test-code',
      };

      await authController.googleCallback(mockReq as Request, mockRes as Response);

      expect(mockRes.redirect).toHaveBeenCalledWith(307, 'http://frontend.test?error=oauth_failed');
    });
  });
});
