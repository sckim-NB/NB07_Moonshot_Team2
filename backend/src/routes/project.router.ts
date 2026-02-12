import express from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth.middleware';
import {
  createProject,
  getProject,
  updateProject,
  deleteProject,
} from '../controllers/project.controller';

const router = express.Router();

router.post('/', authenticate, asyncHandler(createProject));
router.get('/:projectId', authenticate, asyncHandler(getProject));
router.patch('/:projectId', authenticate, asyncHandler(updateProject));
router.delete('/:projectId', authenticate, asyncHandler(deleteProject));

export default router;
