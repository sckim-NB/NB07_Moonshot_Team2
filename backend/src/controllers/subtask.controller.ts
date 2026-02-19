import { RequestHandler } from 'express';
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

// 요청자 ID 추출 및 검증
const getRequesterId = (req: unknown): string => {
  const userId = (req as { userId?: unknown }).userId;

  if (typeof userId !== 'string' || !userId) throw new LoginRequiredError();

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
