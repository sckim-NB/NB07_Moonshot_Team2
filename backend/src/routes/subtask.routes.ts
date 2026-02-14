import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { createSubtask, getSubtasksByTask, getSubtaskById } from '../controllers/subtask.controller.js';

const router = Router();

router.use(authenticate);

router.post('/:projectId/tasks/:taskId/subtasks', asyncHandler(createSubtask));
router.get('/:projectId/tasks/:taskId/subtasks', asyncHandler(getSubtasksByTask));
router.get('/:projectId/subtasks/:subtaskId', asyncHandler(getSubtaskById));

export default router;
