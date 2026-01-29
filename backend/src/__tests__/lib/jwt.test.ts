import jwt from 'jsonwebtoken';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  JwtPayload,
} from '../../lib/jwt.js';
import { env } from '../../lib/env.js';

describe('JWT 유틸리티', () => {
  const testUserId = 'test-user-123';

  describe('generateAccessToken', () => {
    it('생성된 토큰이 즉시 검증 가능해야 함', () => {
      const token = generateAccessToken(testUserId);
      const result = verifyAccessToken(token);

      expect(result.valid).toBe(true);
      expect(result.payload).toBeDefined();
      expect(result.payload?.userId).toBe(testUserId);
    });

    it('페이로드에 userId가 포함되어야 함', () => {
      const token = generateAccessToken(testUserId);
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

      expect(decoded.userId).toBe(testUserId);
    });
  });

  describe('generateRefreshToken', () => {
    it('생성된 토큰이 즉시 검증 가능해야 함', () => {
      const token = generateRefreshToken(testUserId);
      const result = verifyRefreshToken(token);

      expect(result.valid).toBe(true);
      expect(result.payload).toBeDefined();
      expect(result.payload?.userId).toBe(testUserId);
    });

    it('페이로드에 userId가 포함되어야 함', () => {
      const token = generateRefreshToken(testUserId);
      const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as JwtPayload;

      expect(decoded.userId).toBe(testUserId);
    });
  });

  describe('verifyAccessToken', () => {
    it('유효한 토큰을 검증하면 valid: true를 반환해야 함', () => {
      const token = generateAccessToken(testUserId);
      const result = verifyAccessToken(token);

      expect(result.valid).toBe(true);
      expect(result.payload).toBeDefined();
      expect(result.payload?.userId).toBe(testUserId);
      expect(result.expired).toBeUndefined();
    });

    it('만료된 토큰을 검증하면 expired: true를 반환해야 함', async () => {
      // 1ms 후 만료되는 토큰 생성
      const expiredToken = jwt.sign({ userId: testUserId } as JwtPayload, env.JWT_SECRET, {
        expiresIn: '1ms',
      });

      // 토큰이 만료될 때까지 대기
      await new Promise((resolve) => setTimeout(resolve, 10));

      const result = verifyAccessToken(expiredToken);

      expect(result.valid).toBe(false);
      expect(result.expired).toBe(true);
      expect(result.payload).toBeUndefined();
    });

    it('잘못된 시크릿으로 생성된 토큰을 검증하면 valid: false를 반환해야 함', () => {
      const invalidToken = jwt.sign({ userId: testUserId } as JwtPayload, 'wrong-secret', {
        expiresIn: '1h',
      });

      const result = verifyAccessToken(invalidToken);

      expect(result.valid).toBe(false);
      expect(result.expired).toBe(false);
      expect(result.payload).toBeUndefined();
    });

    it('잘못된 형식의 토큰을 검증하면 valid: false를 반환해야 함', () => {
      const invalidToken = 'invalid.token.format';
      const result = verifyAccessToken(invalidToken);

      expect(result.valid).toBe(false);
      expect(result.expired).toBe(false);
      expect(result.payload).toBeUndefined();
    });
  });

  describe('verifyRefreshToken', () => {
    it('유효한 토큰을 검증하면 valid: true를 반환해야 함', () => {
      const token = generateRefreshToken(testUserId);
      const result = verifyRefreshToken(token);

      expect(result.valid).toBe(true);
      expect(result.payload).toBeDefined();
      expect(result.payload?.userId).toBe(testUserId);
      expect(result.expired).toBeUndefined();
    });

    it('만료된 토큰을 검증하면 expired: true를 반환해야 함', async () => {
      // 1ms 후 만료되는 토큰 생성
      const expiredToken = jwt.sign({ userId: testUserId } as JwtPayload, env.JWT_REFRESH_SECRET, {
        expiresIn: '1ms',
      });

      // 토큰이 만료될 때까지 대기
      await new Promise((resolve) => setTimeout(resolve, 10));

      const result = verifyRefreshToken(expiredToken);

      expect(result.valid).toBe(false);
      expect(result.expired).toBe(true);
      expect(result.payload).toBeUndefined();
    });

    it('잘못된 시크릿으로 생성된 토큰을 검증하면 valid: false를 반환해야 함', () => {
      const invalidToken = jwt.sign({ userId: testUserId } as JwtPayload, 'wrong-secret', {
        expiresIn: '1h',
      });

      const result = verifyRefreshToken(invalidToken);

      expect(result.valid).toBe(false);
      expect(result.expired).toBe(false);
      expect(result.payload).toBeUndefined();
    });
  });
});
