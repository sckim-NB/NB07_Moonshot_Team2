import { InvalidRequestError } from '../lib/errors.js';
import type { SubtaskStatusDto } from '../dtos/subtask.dto.js';

export const parseTaskId = (taskId: unknown): string => {
  if (typeof taskId !== 'string' || !taskId) throw new InvalidRequestError();
  return taskId;
};

export const parseSubtaskId = (subtaskId: unknown): string => {
  if (typeof subtaskId !== 'string' || !subtaskId) throw new InvalidRequestError();
  return subtaskId;
};

export const parseSubtaskTitle = (title: unknown): string => {
  if (typeof title !== 'string') throw new InvalidRequestError();

  const trimmed = title.trim();
  if (!trimmed) throw new InvalidRequestError();

  return trimmed;
};

export const parseSubtaskStatus = (status: unknown): SubtaskStatusDto => {
  if (status !== 'todo' && status !== 'in_progress' && status !== 'done') {
    throw new InvalidRequestError();
  }
  return status;
};

export const parseCreateSubtaskBody = (body: unknown): { title: string } => {
  const title = parseSubtaskTitle((body as { title?: unknown })?.title);
  return { title };
};

export const parseUpdateSubtaskBody = (
  body: unknown
): { title?: string; status?: SubtaskStatusDto } => {
  const raw = body as { title?: unknown; status?: unknown };

  const hasTitle = raw?.title !== undefined;
  const hasStatus = raw?.status !== undefined;

  if (!hasTitle && !hasStatus) throw new InvalidRequestError();

  const title = hasTitle ? parseSubtaskTitle(raw.title) : undefined;
  const status = hasStatus ? parseSubtaskStatus(raw.status) : undefined;

  return { title, status };
};
