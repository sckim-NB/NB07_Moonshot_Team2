import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';

const userRouter = Router();
const userController = new UserController();

// #21 내 정보 조회
userRouter.get('/me', authenticate, userController.getMyInfo);

// #22 내 정보 수정
userRouter.patch('/me', authenticate, userController.updateMyInfo);

// #23 참여 중인 프로젝트 조회
userRouter.get('/me/projects', authenticate, userController.getUserProjects);

// #24 참여 중인 모든 프로젝트의 할 일 목록 조회
userRouter.get('/me/projects/tasks', authenticate, userController.getMyTasks);

export default userRouter;
