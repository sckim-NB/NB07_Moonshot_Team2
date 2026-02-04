import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getProjectMembers,
  inviteProjectMember,
  removeInvitation,
} from '../controllers/member.controller.js';

const router = Router();

router.get('/projects/:projectId/users', asyncHandler(getProjectMembers));
router.post('/projects/:projectId/invitations', asyncHandler(inviteProjectMember));
router.delete('/invitations/:invitationId', asyncHandler(removeInvitation));

export default router;
