import { Request, RequestHandler } from 'express';
import { User as PrismaUser } from '@prisma/client';
import { InvalidRequestError, LoginRequiredError } from '../lib/errors.js';
import { memberService } from '../services/member.service.js';

type ProjectParams = { projectId: string };
type InvitationParams = { invitationId: string };
type ProjectUserParams = { projectId: string; userId: string };
type AuthenticatedRequest = Request & {
  user?: PrismaUser;
  userId?: string;
};
// 요청자 ID 추출 및 검증
const getRequesterId = (req: Request): string => {
  const authReq = req as AuthenticatedRequest;
  const userId = authReq.user?.id || authReq.userId;

  if (typeof userId !== 'string' || !userId) {
    throw new LoginRequiredError();
  }

  return userId;
};

// 페이지네이션 파싱 및 검증
const parsePagination = (pageRaw: unknown, limitRaw: unknown) => {
  const page = pageRaw ? Number(pageRaw) : 1;
  const limit = limitRaw ? Number(limitRaw) : 10;

  if (!Number.isInteger(page) || !Number.isInteger(limit) || page < 1 || limit < 1) {
    throw new InvalidRequestError();
  }

  return { page, limit };
};

// 이메일 검증
const validateEmail = (email: unknown): string => {
  if (typeof email !== 'string') throw new InvalidRequestError();

  const trimmed = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(trimmed)) throw new InvalidRequestError();

  return trimmed;
};

// 멤버 목록 조회
export const getProjectMembers: RequestHandler = async (req, res) => {
  const { projectId } = req.params as ProjectParams;
  if (!projectId) throw new InvalidRequestError();

  const { page, limit } = parsePagination(req.query.page, req.query.limit);
  const requesterId = getRequesterId(req);

  const result = await memberService.getProjectMembers({
    projectId,
    requesterId,
    page,
    limit,
  });

  res.status(200).json(result);
};

// 멤버 초대
export const inviteProjectMember: RequestHandler = async (req, res) => {
  const { projectId } = req.params as ProjectParams;
  if (!projectId) throw new InvalidRequestError();

  const email = validateEmail(req.body?.email);
  const requesterId = getRequesterId(req);

  const { invitationId } = await memberService.inviteProjectMember({
    projectId,
    requesterId,
    email,
  });

  res.status(201).json({ invitationId });
};

// 초대 취소
export const removeInvitation: RequestHandler = async (req, res) => {
  const { invitationId } = req.params as InvitationParams;
  if (!invitationId) throw new InvalidRequestError();

  const requesterId = getRequesterId(req);

  await memberService.removeInvitation({ invitationId, requesterId });

  res.status(204).send();
};

// 초대 수락
export const acceptInvitation: RequestHandler = async (req, res) => {
  const { invitationId } = req.params as InvitationParams;
  if (!invitationId) throw new InvalidRequestError();

  const requesterId = getRequesterId(req);

  await memberService.acceptInvitation({ invitationId, requesterId });

  res.status(200).send();
};

// 멤버 제외
export const removeProjectMember: RequestHandler = async (req, res) => {
  const { projectId, userId } = req.params as ProjectUserParams;
  if (!projectId || !userId) throw new InvalidRequestError();

  const requesterId = getRequesterId(req);

  await memberService.removeProjectMember({ projectId, requesterId, userId });

  res.status(204).send();
};
