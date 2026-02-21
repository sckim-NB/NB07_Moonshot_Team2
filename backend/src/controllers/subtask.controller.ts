import { Request, RequestHandler } from 'express';
// import { User as PrismaUser } from '@prisma/client';
import { LoginRequiredError } from '../lib/errors.js';
import { subtaskService } from '../services/subtask.service.js';
import {
  parseTaskId,
  parseSubtaskId,
  parseCreateSubtaskBody,
  parseUpdateSubtaskBody,
} from '../validators/subtask.validator.js';

type TaskParams = { taskId: string };
type SubtaskParams = { subtaskId: string };
// type AuthenticatedRequest = Request & {
//   user: PrismaUser; // express.d.ts와 동일하게 PrismaUser 타입을 사용하세요.
// };
// 요청자 ID 추출 및 검증
const getRequesterId = (req: Request): string => {
  // 🚨 기존: const userId = (req as { userId?: unknown }).userId;
  // ✅ 수정: 보통 미들웨어는 req.user에 정보를 담습니다.
  // 만약 미들웨어에서 req.userId = user.id 로 설정했다면 그대로 두되,
  // 아니라면 아래처럼 req.user.id를 확인해야 합니다.
  // const authReq = req as AuthenticatedRequest;
  const userId = req.user?.id || req.userId;

  if (!userId || typeof userId !== 'string') {
    throw new LoginRequiredError();
  }
  return userId;
};

// subtask 생성
export const createSubtask: RequestHandler = async (req, res) => {
  const { taskId: taskIdRaw } = req.params as TaskParams;
  const taskId = parseTaskId(taskIdRaw);

  const requesterId = getRequesterId(req);
  const { title } = parseCreateSubtaskBody(req.body);

  const result = await subtaskService.createSubtask({ taskId, requesterId, title });

  res.status(201).json(result);
};

// subtask 목록 조회
export const getSubtasksByTask: RequestHandler = async (req, res) => {
  const { taskId: taskIdRaw } = req.params as TaskParams;
  const taskId = parseTaskId(taskIdRaw);

  const requesterId = getRequesterId(req);

  const result = await subtaskService.getSubtasks({ taskId, requesterId });

  res.status(200).json(result);
};

// subtask 조회
export const getSubtaskById: RequestHandler = async (req, res) => {
  const { subtaskId: subtaskIdRaw } = req.params as SubtaskParams;
  const subtaskId = parseSubtaskId(subtaskIdRaw);

  const requesterId = getRequesterId(req);

  const result = await subtaskService.getSubtask({ subtaskId, requesterId });

  res.status(200).json(result);
};

// subtask 수정
export const updateSubtask: RequestHandler = async (req, res) => {
  const { subtaskId: subtaskIdRaw } = req.params as SubtaskParams;
  const subtaskId = parseSubtaskId(subtaskIdRaw);

  const requesterId = getRequesterId(req);

  const { title, status } = parseUpdateSubtaskBody(req.body);

  const result = await subtaskService.updateSubtask({
    subtaskId,
    requesterId,
    title,
    status,
  });

  res.status(200).json(result);
};

// subtask 삭제
export const deleteSubtask: RequestHandler = async (req, res) => {
  const { subtaskId: subtaskIdRaw } = req.params as SubtaskParams;
  const subtaskId = parseSubtaskId(subtaskIdRaw);

  const requesterId = getRequesterId(req);

  await subtaskService.deleteSubtask({ subtaskId, requesterId });

  res.status(204).send();
};
