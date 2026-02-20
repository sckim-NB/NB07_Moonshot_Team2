import request from 'supertest';
import app from '../../app.js';
import { prisma } from '../../lib/db.js';
import { hashPassword } from '../../lib/password.js';

describe('Auth Routes', () => {
  beforeAll(async () => {
    // 테스트용 유저 생성
    const hashedPassword = await hashPassword('Test1234');
    await prisma.user.create({
      data: {
        email: 'authtest@example.com',
        name: 'Auth Test User',
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
          in: ['authtest@example.com', 'newuser@example.com'],
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('POST /auth/register', () => {
    it('새 유저를 생성하고 201을 반환해야 함', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'newuser@example.com',
        password: 'NewPass1234',
        name: 'New User',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.email).toBe('newuser@example.com');
      expect(response.body.name).toBe('New User');
      expect(response.body).not.toHaveProperty('password');
      expect(response.body).not.toHaveProperty('provider');
    });

    it('중복된 이메일로 회원가입 시 400을 반환해야 함', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'authtest@example.com',
        password: 'Test1234',
        name: 'Duplicate User',
      });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('이미 가입한 이메일입니다.');
    });

    it('유효하지 않은 이메일 형식은 400을 반환해야 함', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'invalid-email',
        password: 'Test1234',
        name: 'Test User',
      });

      expect(response.status).toBe(400);
    });

    it('약한 비밀번호 형식은 400을 반환해야 함', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test2@example.com',
        password: '123',
        name: 'Test User',
      });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /auth/login', () => {
    it('올바른 자격증명으로 토큰을 반환해야 함', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'authtest@example.com',
        password: 'Test1234',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(typeof response.body.accessToken).toBe('string');
      expect(typeof response.body.refreshToken).toBe('string');
    });

    it('잘못된 이메일로 404를 반환해야 함', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'nonexistent@example.com',
        password: 'Test1234',
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('존재하지 않거나 비밀번호가 일치하지 않습니다');
    });

    it('잘못된 비밀번호로 404를 반환해야 함', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'authtest@example.com',
        password: 'WrongPassword123',
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('존재하지 않거나 비밀번호가 일치하지 않습니다');
    });
  });

  describe('POST /auth/refresh', () => {
    it('유효한 refresh token으로 새 토큰을 반환해야 함', async () => {
      // 먼저 로그인하여 토큰 획득
      const loginResponse = await request(app).post('/api/auth/login').send({
        email: 'authtest@example.com',
        password: 'Test1234',
      });

      const { refreshToken } = loginResponse.body;

      // refresh 요청
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${refreshToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
    });

    it('Authorization 헤더 없이 400을 반환해야 함', async () => {
      const response = await request(app).post('/api/auth/refresh');

      expect(response.status).toBe(400);
    });

    it('잘못된 refresh token으로 400을 반환해야 함', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(400);
    });
  });

  describe('Rate Limiting', () => {
    it('/auth/login에 rate limit이 적용되어야 함', async () => {
      // 6번 성공적인 로그인 시도 (skipFailedRequests=true이므로 성공 요청만 카운트)
      for (let i = 0; i < 6; i++) {
        await request(app).post('/api/auth/login').send({
          email: 'authtest@example.com',
          password: 'Test1234',
        });
      }

      // 7번째 시도는 rate limit에 걸려야 함
      const response = await request(app).post('/api/auth/login').send({
        email: 'authtest@example.com',
        password: 'Test1234',
      });

      expect(response.status).toBe(429);
    }, 30000); // 타임아웃 30초
  });
});
