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
}