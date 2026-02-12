// src/controllers/user.controller.ts
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
      next(error);
    }
  };

  updateMyInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = req as RequestWithUserId;
      const userId = request.userId;

      const updatedUser = await this.userService.updateMyInfo(userId, req.body);
      return res.status(200).json(updatedUser);
    } catch (error) {
      next(error);
    }
  };

  getUserProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = req as RequestWithUserId;
      const userId = request.userId;

      const result = await this.userService.getUserProjects(userId, req.query);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
  getMyTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request = req as RequestWithUserId; // 인터페이스 확장 상황에 맞춰 캐스팅
      const userId = request.userId; // 미들웨어에서 넣어준 userId 사용

      const result = await this.userService.getMyTasks(userId, req.query);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // express.d.ts 파일 수정 후 아래 코드 실행
  // getMyInfo = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     // authMiddleware에서 토큰을 해석해 저장한 userId(string)
  //     const userId = (req.user as {id:string}).id;
  //     const userInfo = await this.userService.getMyInfo(userId);

  //     return res.status(200).json(userInfo);
  //   } catch (error) {
  //     next(error);
  //   }
  // };
  // updateMyInfo = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const userId = (req.user as { id: string }).id; // express.d.ts 파일 확인필요
  //     // 서비스 호출
  //     const updatedUser = await this.userService.updateMyInfo(userId, req.body);

  //     return res.status(200).json(updatedUser);
  //   } catch (error) {
  //     next(error);
  //   }
  // };
  // getUserProjects = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     //express.d.ts 수정 필요
  //     const userId = (req.user as { id: string }).id;

  //     const result = await this.userService.getUserProjects(userId, req.query);
  //     return res.status(200).json(result);
  //   } catch (error) {
  //     next(error);
  //   }
  // };
}
