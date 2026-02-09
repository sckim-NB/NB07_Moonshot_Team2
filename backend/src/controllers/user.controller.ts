// src/controllers/user.controller.ts
import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";

export class UserController {
  private userService = new UserService();

  getMyInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // authMiddleware에서 토큰을 해석해 저장한 userId(string)
      const userId = (req.user as {id:string}).id; 
      const userInfo = await this.userService.getMyInfo(userId);

      // 200 OK
      return res.status(200).json(userInfo);
    } catch (error) {
      next(error);
    }
  };
  updateMyInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as { id: string }).id; // express.d.ts 파일 확인필요
      // 서비스 호출
      const updatedUser = await this.userService.updateMyInfo(userId, req.body);

      // 200 OK 응답
      return res.status(200).json(updatedUser);
    } catch (error) {
      next(error); 
    }
  };
  getUserProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user as { id: string }).id;

      // 2. 서비스 호출 (Pagination 및 정렬 조건 전달)
      const result = await this.userService.getUserProjects(userId, req.query);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}