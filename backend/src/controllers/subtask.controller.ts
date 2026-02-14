import { RequestHandler } from 'express';
import { InvalidRequestError, LoginRequiredError } from '../lib/errors.js';
import { subtaskService } from '../services/subtask.service.js';

type TaskParams = { taskId: string };
type SubtaskParams = { subtaskId: string };

// 요청자 ID 추출 및 검증
const getRequesterId = (req: unknown): string => {
  const userId = (req as { userId?: unknown }).userId;

  if (typeof userId !== 'string' || !userId) {
    throw new LoginRequiredError();
  }

  return userId;
};

// title 검증
const validateTitle = (title: unknown): string => {
  if (typeof title !== 'string') throw new InvalidRequestError();

  const trimmed = title.trim();
  if (!trimmed) throw new InvalidRequestError();

  return trimmed;
};

// subtask 생성
export const createSubtask: RequestHandler = async (req, res) => {
  const { taskId } = req.params as TaskParams;
  if (!taskId) throw new InvalidRequestError();

  const requesterId = getRequesterId(req);
  const title = validateTitle(req.body?.title);

  const result = await subtaskService.createSubtask({ taskId, requesterId, title });

  res.status(201).json(result);
};

// subtask 목록 조회
export const getSubtasksByTask: RequestHandler = async (req, res) => {
  const { taskId } = req.params as TaskParams;
  if (!taskId) throw new InvalidRequestError();

  const requesterId = getRequesterId(req);

  const result = await subtaskService.getSubtasks({ taskId, requesterId });

  res.status(200).json(result);
};

// subtask 조회
export const getSubtaskById: RequestHandler = async (req, res) => {
  const { subtaskId } = req.params as SubtaskParams;
  if (!subtaskId) throw new InvalidRequestError();

  const requesterId = getRequesterId(req);

  const result = await subtaskService.getSubtask({ subtaskId, requesterId });

  res.status(200).json(result);
};