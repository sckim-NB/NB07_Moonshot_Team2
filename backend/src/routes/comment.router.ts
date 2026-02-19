import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  createComment,
  listComments,
  getComment,
  updateComment,
  deleteComment,
} from '../controllers/comment.controller.js';

const router = Router();

router.post('/tasks/:taskId/comments', authenticate, asyncHandler(createComment));
router.get('/tasks/:taskId/comments', authenticate, asyncHandler(listComments));
router.get('/comments/:commentId', authenticate, asyncHandler(getComment));
router.patch('/comments/:commentId', authenticate, asyncHandler(updateComment));
router.delete('/comments/:commentId', authenticate, asyncHandler(deleteComment));

export default router;
