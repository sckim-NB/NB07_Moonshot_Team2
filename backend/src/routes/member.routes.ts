import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getProjectMembers } from '../controllers/member.controller.js';

const router = Router();

router.get('/projects/:projectId/users', asyncHandler(getProjectMembers));

export default router;
