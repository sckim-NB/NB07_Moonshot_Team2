import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
  private userService = new UserService();

  // #21 내 정보 조회
  getMyInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const userInfo = await this.userService.getMyInfo(userId);

      return res.status(200).json(userInfo);
    } catch (error) {
      return next(error);
    }
  };

  // #22 내 정보 수정
  updateMyInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const updatedUser = await this.userService.updateMyInfo(userId, req.body);

      return res.status(200).json(updatedUser);
    } catch (error) {
      return next(error);
    }
  };

  // #23 참여 중인 프로젝트 조회
  getUserProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;

      const result = await this.userService.getUserProjects(userId, req.query);
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };

  // #24 참여 중인 모든 프로젝트의 할 일 목록 조회
  getMyTasks = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const result = await this.userService.getMyTasks(userId, req.query);

      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  };
}
