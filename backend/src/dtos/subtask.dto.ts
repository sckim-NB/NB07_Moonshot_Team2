import type { TaskStatus } from '@prisma/client';

export type SubtaskStatusDto = 'todo' | 'in_progress' | 'done';

export type SubtaskResponseDto = {
  id: string;
  taskId: string;
  title: string;
  status: SubtaskStatusDto;
  order: number;
  createdAt: string;
  updatedAt: string;
};

// DB(enum) -> API(string) 변환
export const toApiSubtaskStatus = (s: TaskStatus): SubtaskStatusDto => {
  if (s === 'TODO') return 'todo';
  if (s === 'IN_PROGRESS') return 'in_progress';
  return 'done';
};

// API(string) -> DB(enum) 변환
export const toDbSubtaskStatus = (s: SubtaskStatusDto): TaskStatus => {
  if (s === 'todo') return 'TODO';
  if (s === 'in_progress') return 'IN_PROGRESS';
  return 'DONE';
};

// subtask -> 응답 DTO 변환
export const toSubtaskResponseDto = (subtask: {
  id: string;
  taskId: string;
  title: string;
  status: TaskStatus;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}): SubtaskResponseDto => ({
  id: subtask.id,
  taskId: subtask.taskId,
  title: subtask.title,
  status: toApiSubtaskStatus(subtask.status),
  order: subtask.order,
  createdAt: subtask.createdAt.toISOString(),
  updatedAt: subtask.updatedAt.toISOString(),
});
