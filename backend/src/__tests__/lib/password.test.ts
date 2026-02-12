import { hashPassword, comparePassword } from '../../lib/password.js';

describe('비밀번호 유틸리티', () => {
  const testPassword = 'TestPassword123!';

  describe('hashPassword', () => {
    it('해싱된 비밀번호가 원본과 달라야 함', async () => {
      const hashed = await hashPassword(testPassword);
      expect(hashed).not.toBe(testPassword);
    });

    it('동일한 비밀번호를 두 번 해싱하면 다른 결과가 나와야 함 (salt 검증)', async () => {
      const hashed1 = await hashPassword(testPassword);
      const hashed2 = await hashPassword(testPassword);

      expect(hashed1).not.toBe(hashed2);
    });

    it('해싱된 비밀번호가 bcrypt 형식이어야 함', async () => {
      const hashed = await hashPassword(testPassword);
      // bcrypt 해시는 $2a$ 또는 $2b$로 시작
      expect(hashed).toMatch(/^\$2[ab]\$/);
    });
  });

  describe('comparePassword', () => {
    it('올바른 비밀번호와 해시 비교 시 true를 반환해야 함', async () => {
      const hashed = await hashPassword(testPassword);
      const result = await comparePassword(testPassword, hashed);

      expect(result).toBe(true);
    });

    it('잘못된 비밀번호와 해시 비교 시 false를 반환해야 함', async () => {
      const hashed = await hashPassword(testPassword);
      const result = await comparePassword('WrongPassword123!', hashed);

      expect(result).toBe(false);
    });

    it('빈 문자열 비교 시 false를 반환해야 함', async () => {
      const hashed = await hashPassword(testPassword);
      const result = await comparePassword('', hashed);

      expect(result).toBe(false);
    });

    it('대소문자가 다르면 false를 반환해야 함', async () => {
      const hashed = await hashPassword(testPassword);
      const result = await comparePassword(testPassword.toLowerCase(), hashed);

      expect(result).toBe(false);
    });
  });
});
