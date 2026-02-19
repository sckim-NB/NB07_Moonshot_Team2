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

router.post('/:projectId/tasks/:taskId/subtasks', asyncHandler(createSubtask));
router.get('/:projectId/tasks/:taskId/subtasks', asyncHandler(getSubtasksByTask));
router.get('/:projectId/subtasks/:subtaskId', asyncHandler(getSubtaskById));
router.patch('/:projectId/subtasks/:subtaskId', asyncHandler(updateSubtask));
router.delete('/:projectId/subtasks/:subtaskId', asyncHandler(deleteSubtask));

export default router;
