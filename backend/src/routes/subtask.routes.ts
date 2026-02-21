import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  createSubtask,
  getSubtasksByTask,
  getSubtaskById,
  updateSubtask,
  deleteSubtask,
} from '../controllers/subtask.controller.js';

const router = Router();

router.use(authenticate);

// 🚨 기존: router.post('/:projectId/tasks/:taskId/subtasks', ...)
// ✅ 수정: 명세서와 프론트 호출 주소에 맞게 :projectId 제거
router.post('/tasks/:taskId/subtasks', asyncHandler(createSubtask));
router.get('/tasks/:taskId/subtasks', asyncHandler(getSubtasksByTask));
router.get('/subtasks/:subtaskId', asyncHandler(getSubtaskById));
router.patch('/subtasks/:subtaskId', asyncHandler(updateSubtask));
router.delete('/subtasks/:subtaskId', asyncHandler(deleteSubtask));

export default router;
