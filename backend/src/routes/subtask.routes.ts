import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { createSubtask, getSubtasksByTask } from '../controllers/subtask.controller.js';

const router = Router();

router.use(authenticate);

router.post('/tasks/:taskId/subtasks', asyncHandler(createSubtask));
router.get('/tasks/:taskId/subtasks', asyncHandler(getSubtasksByTask));

export default router;
