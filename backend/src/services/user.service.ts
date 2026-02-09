import bcrypt from "bcrypt";
import { UserRepository } from "../repositories/user.repository";
import { UserNotFoundError, InvalidRequestError, InvalidDataFormatError } from "../lib/errors";

// 유저 업데이트 DTO
interface UpdateUserDto {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
  profileImage?: string | null;
}

export class UserService {
private userRepository = new UserRepository();

  async getMyInfo(userId: string) {
    const user = await this.userRepository.findById(userId);
     // 400 bad request error { "message": "잘못된 요청입니다"}
     if (!userId) {
      throw new InvalidRequestError(); 
    }
     // 404 Not Found error { "message": "존재하지 않는 유저입니다."}
     if (!user) {
      throw new UserNotFoundError();
    }
    return user;
     // 401 Unauthorized error { "message": "로그인이 필요합니다"}
     // 401 Unauthorized error(토큰) { "message": "토큰 만료"}
  }
  async updateMyInfo(userId: string, body: UpdateUserDto) {
    const { name, currentPassword, newPassword, profileImage } = body;

    // 유저 존재 검증
    const user = await this.userRepository.findRawById(userId);
    if (!user) throw new UserNotFoundError();

    const updateData:  {
      name?: string;
      password?: string;
      profileImage?: string | null;
    } = {};

    if (name) updateData.name = name;
    if (profileImage !== undefined) updateData.profileImage = profileImage;

    // 비밀번호 변경 - 검증 ( 400, 401 error - 401 error는 미들웨어에서)
    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        throw new InvalidDataFormatError();
      }

      // 현재 비밀번호 일치 여부 (소셜 로그인 유저는 password가 null일 수)
      if (!user.password) throw new InvalidRequestError(); 
      
      const isMatchPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isMatchPassword) {
        throw new InvalidRequestError(); // 비밀번호 불일치 시 400
      }

      // 새 비밀번호
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    return await this.userRepository.update(userId, updateData);
  }
}
