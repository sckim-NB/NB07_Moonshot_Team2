import { RequestHandler } from 'express';
import { InvalidRequestError, LoginRequiredError } from '../lib/errors.js';
import { subtaskService } from '../services/subtask.service.js';
import type { SubtaskStatusDto } from '../dtos/subtask.dto.js';

type TaskParams = { taskId: string };
type SubtaskParams = { subtaskId: string };

// 요청자 ID 추출 및 검증
const getRequesterId = (req: unknown): string => {
  const userId = (req as { userId?: unknown }).userId;

  if (typeof userId !== 'string' || !userId) throw new LoginRequiredError();

  return userId;
};

// title 검증
const validateTitle = (title: unknown): string => {
  if (typeof title !== 'string') throw new InvalidRequestError();

  const trimmed = title.trim();
  if (!trimmed) throw new InvalidRequestError();

  return trimmed;
};

// status 검증
const validateStatus = (status: unknown): SubtaskStatusDto => {
  if (status !== 'todo' && status !== 'in_progress' && status !== 'done') {
    throw new InvalidRequestError();
  }

  return status;
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

// subtask 수정
export const updateSubtask: RequestHandler = async (req, res) => {
  const { subtaskId } = req.params as SubtaskParams;
  if (!subtaskId) throw new InvalidRequestError();

  const requesterId = getRequesterId(req);

  const titleRaw = req.body?.title;
  const statusRaw = req.body?.status;

  const hasTitle = titleRaw !== undefined;
  const hasStatus = statusRaw !== undefined;

  if (!hasTitle && !hasStatus) throw new InvalidRequestError();

  const title = hasTitle ? validateTitle(titleRaw) : undefined;
  const status = hasStatus ? validateStatus(statusRaw) : undefined;

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
  const { subtaskId } = req.params as SubtaskParams;
  if (!subtaskId) throw new InvalidRequestError();

  const requesterId = getRequesterId(req);

  await subtaskService.deleteSubtask({ subtaskId, requesterId });

  res.status(204).send();
};