import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  getProjectMembers,
  inviteProjectMember,
  removeInvitation,
  acceptInvitation,
  removeProjectMember,
} from '../controllers/member.controller.js';

const router = Router();

router.get('/projects/:projectId/users', asyncHandler(getProjectMembers));
router.post('/projects/:projectId/invitations', asyncHandler(inviteProjectMember));
router.delete('/invitations/:invitationId', asyncHandler(removeInvitation));
router.post('/invitations/:invitationId/accept', asyncHandler(acceptInvitation));
router.delete('/projects/:projectId/users/:userId', asyncHandler(removeProjectMember));

export default router;
