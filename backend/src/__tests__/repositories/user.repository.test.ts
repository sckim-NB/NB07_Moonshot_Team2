import * as userRepository from '../../repositories/user.repository.js';
import { prisma } from '../../lib/db.js';
import { hashPassword } from '../../lib/password.js';
import { Provider } from '@prisma/client';

describe('User Repository', () => {
  beforeAll(async () => {
    // 테스트용 유저 생성
    const hashedPassword = await hashPassword('RepoTest1234');
    await prisma.user.create({
      data: {
        email: 'repotest@example.com',
        name: 'Repo Test User',
        password: hashedPassword,
        provider: Provider.LOCAL,
      },
    });
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'repotest@example.com',
            'newrepouser@example.com',
            'googleuser@example.com',
            'existinggoogleuser@example.com',
          ],
        },
      },
    });
    await prisma.$disconnect();
  });

  describe('findByEmail', () => {
    it('이메일로 유저를 찾아야 함', async () => {
      const user = await userRepository.findByEmail('repotest@example.com');

      expect(user).not.toBeNull();
      expect(user?.email).toBe('repotest@example.com');
      expect(user?.name).toBe('Repo Test User');
    });

    it('존재하지 않는 이메일로 null을 반환해야 함', async () => {
      const user = await userRepository.findByEmail('nonexistent@example.com');

      expect(user).toBeNull();
    });
  });

  describe('create', () => {
    it('새 유저를 생성해야 함', async () => {
      const hashedPassword = await hashPassword('NewUser1234');

      const user = await userRepository.create({
        email: 'newrepouser@example.com',
        name: 'New Repo User',
        password: hashedPassword,
      });

      expect(user).toHaveProperty('id');
      expect(user.email).toBe('newrepouser@example.com');
      expect(user.name).toBe('New Repo User');
      expect(user.password).toBe(hashedPassword);
      expect(user.provider).toBe(Provider.LOCAL);
    });

    it('profileImage를 포함하여 유저를 생성해야 함', async () => {
      const hashedPassword = await hashPassword('Test1234');

      const user = await userRepository.create({
        email: 'userWithImage@example.com',
        name: 'User With Image',
        password: hashedPassword,
        profileImage: 'https://example.com/image.jpg',
      });

      expect(user.profileImage).toBe('https://example.com/image.jpg');

      // 정리
      await prisma.user.delete({ where: { email: 'userWithImage@example.com' } });
    });
  });

  describe('findOrCreateByGoogle', () => {
    it('구글 유저가 없으면 새로 생성해야 함', async () => {
      const user = await userRepository.findOrCreateByGoogle({
        email: 'googleuser@example.com',
        name: 'Google User',
        profileImage: 'https://example.com/google.jpg',
      });

      expect(user).toHaveProperty('id');
      expect(user.email).toBe('googleuser@example.com');
      expect(user.name).toBe('Google User');
      expect(user.profileImage).toBe('https://example.com/google.jpg');
      expect(user.provider).toBe(Provider.GOOGLE);
      expect(user.password).toBeNull();
    });

    it('이미 존재하는 구글 유저를 반환해야 함', async () => {
      // 먼저 유저 생성
      const firstUser = await userRepository.findOrCreateByGoogle({
        email: 'existinggoogleuser@example.com',
        name: 'Existing Google User',
      });

      // 같은 이메일로 다시 호출
      const secondUser = await userRepository.findOrCreateByGoogle({
        email: 'existinggoogleuser@example.com',
        name: 'Different Name',
      });

      expect(firstUser.id).toBe(secondUser.id);
      expect(secondUser.name).toBe('Existing Google User'); // 기존 이름 유지
    });

    it('profileImage 없이 구글 유저를 생성해야 함', async () => {
      const user = await userRepository.findOrCreateByGoogle({
        email: 'googlenophoto@example.com',
        name: 'Google No Photo',
      });

      expect(user.profileImage).toBeNull();

      // 정리
      await prisma.user.delete({ where: { email: 'googlenophoto@example.com' } });
    });
  });
});
