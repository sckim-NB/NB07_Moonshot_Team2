import express from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { authenticate } from '../middleware/auth.middleware';
import {
  createProject,
  getProject,
  updateProject,
  deleteProject,
} from '../controllers/project.controller';

const projectsRouter = express.Router();

projectsRouter.post('/', authenticate, asyncHandler(createProject));
projectsRouter.get('/:projectId', authenticate, asyncHandler(getProject));
projectsRouter.patch('/:projectId', authenticate, asyncHandler(updateProject));
projectsRouter.delete('/:projectId', authenticate, asyncHandler(deleteProject));

export default projectsRouter;
