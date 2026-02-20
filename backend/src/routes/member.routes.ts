import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { authenticate } from '../middleware/auth.middleware.js';

import {
  getProjectMembers,
  inviteProjectMember,
  removeInvitation,
  acceptInvitation,
  removeProjectMember,
} from '../controllers/member.controller.js';

const router = Router();

router.use(authenticate);

//라우터 내부의 경로 정의와 프론트엔드 api.ts에서 사용하는 엔드포인트가 서로 다르기 때문에 수정
router.get('/projects/:projectId/members', asyncHandler(getProjectMembers));
router.post('/projects/:projectId/invitations', asyncHandler(inviteProjectMember));
router.delete('/invitations/:invitationId', asyncHandler(removeInvitation));
router.post('/invitations/:invitationId/accept', asyncHandler(acceptInvitation));
router.delete('/projects/:projectId/users/:userId', asyncHandler(removeProjectMember));

export default router;
