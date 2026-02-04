import { UserRepository } from "../repositories/user.repository";
import { UserNotFoundError, InvalidRequestError } from "../lib/errors";

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
}
