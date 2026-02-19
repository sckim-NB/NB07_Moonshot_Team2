import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  createTask,
  deleteTask,
  getTask,
  listTasks,
  updateTask,
} from '../controllers/task.controller.js';

const router = Router();

router.post('/projects/:projectId/tasks', authenticate, asyncHandler(createTask));
router.get('/projects/:projectId/tasks', authenticate, asyncHandler(listTasks));
router.get('/tasks/:taskId', authenticate, asyncHandler(getTask));
router.patch('/tasks/:taskId', authenticate, asyncHandler(updateTask));
router.delete('/tasks/:taskId', authenticate, asyncHandler(deleteTask));

export default router;
