import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';

// express.d.ts 수정 후 아래 파일 삭제
interface RequestWithUserId extends Request {
  userId: string;
  // 필요한 경우 email, name 등 추가 가능
}
export class UserController {
  private userService = new UserService();
  getMyInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 2. req를 RequestWithUser로 타입 단언 (any 사용 안 함)
      const request = req as RequestWithUserId;
      const userId = request.userId;

      const userInfo = await this.userService.getMyInfo(userId);
      return res.status(200).json(userInfo);
    } catch (error) {
      return next(error);
    }
  };

  updateMyInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = req as RequestWithUserId;
      const userId = request.userId;

      const updatedUser = await this.userService.updateMyInfo(userId, req.body);
      return res.status(200).json(updatedUser);
    } catch (error) {
      return next(error);
    }
  };

  getUserProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = req as RequestWithUserId;
      const userId = request.userId;

      const result = await this.userService.getUserProjects(userId, req.query);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };
  getMyTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = req as RequestWithUserId; // 인터페이스 확장 상황에 맞춰 캐스팅
      const userId = request.userId; // 미들웨어에서 넣어준 userId 사용

      const result = await this.userService.getMyTasks(userId, req.query);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };
}
