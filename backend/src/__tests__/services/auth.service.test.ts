import * as authService from '../../services/auth.service.js';
import { hashPassword } from '../../lib/password.js';
import { prisma } from '../../lib/db.js';

describe('Auth Service', () => {
  beforeAll(async () => {
    // 테스트용 유저 생성
    const hashedPassword = await hashPassword('ServiceTest1234');
    await prisma.user.create({
      data: {
        email: 'servicetest@example.com',
        name: 'Service Test User',
        password: hashedPassword,
        provider: 'LOCAL',
      },
    });
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    await prisma.user.deleteMany({
      where: {
        email: {
          in: ['servicetest@example.com', 'newserviceuser@example.com'],
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('register', () => {
    it('새 유저를 성공적으로 생성해야 함', async () => {
      const userData = {
        email: 'newserviceuser@example.com',
        password: 'NewPass1234',
        name: 'New Service User',
      };

      const user = await authService.register(userData);

      expect(user).toHaveProperty('id');
      expect(user.email).toBe('newserviceuser@example.com');
      expect(user.name).toBe('New Service User');
      expect(user).not.toHaveProperty('password');
    });

    it('중복된 이메일로 EmailAlreadyExistsError를 던져야 함', async () => {
      const userData = {
        email: 'servicetest@example.com',
        password: 'Test1234',
        name: 'Duplicate User',
      };

      await expect(authService.register(userData)).rejects.toThrow('이미 가입한 이메일입니다.');
    });
  });

  describe('login', () => {
    it('올바른 자격증명으로 토큰을 반환해야 함', async () => {
      const loginData = {
        email: 'servicetest@example.com',
        password: 'ServiceTest1234',
      };

      const result = await authService.login(loginData);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(typeof result.accessToken).toBe('string');
      expect(typeof result.refreshToken).toBe('string');
    });

    it('존재하지 않는 이메일로 InvalidCredentialsError를 던져야 함', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'Test1234',
      };

      await expect(authService.login(loginData)).rejects.toThrow(
        '존재하지 않거나 비밀번호가 일치하지 않습니다'
      );
    });

    it('잘못된 비밀번호로 InvalidCredentialsError를 던져야 함', async () => {
      const loginData = {
        email: 'servicetest@example.com',
        password: 'WrongPassword123',
      };

      await expect(authService.login(loginData)).rejects.toThrow(
        '존재하지 않거나 비밀번호가 일치하지 않습니다'
      );
    });
  });

  describe('refreshTokens', () => {
    it('유효한 refresh token으로 새 토큰을 반환해야 함', async () => {
      // 먼저 로그인하여 토큰 획득
      const loginResult = await authService.login({
        email: 'servicetest@example.com',
        password: 'ServiceTest1234',
      });

      // refresh token으로 새 토큰 획득
      const result = await authService.refreshTokens(loginResult.refreshToken);

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(typeof result.accessToken).toBe('string');
      expect(typeof result.refreshToken).toBe('string');
    });

    it('유효하지 않은 refresh token으로 에러를 던져야 함', async () => {
      await expect(authService.refreshTokens('invalid-token')).rejects.toThrow();
    });
  });

  describe('initiateGoogleOAuth', () => {
    it('Google OAuth URL을 반환해야 함', () => {
      const result = authService.initiateGoogleOAuth();

      expect(result).toHaveProperty('url');
      expect(result.url).toContain('https://accounts.google.com/o/oauth2/v2/auth');
      expect(result.url).toContain('client_id=');
      expect(result.url).toContain('redirect_uri=');
      expect(result.url).toContain('scope=');
    });
  });
});
