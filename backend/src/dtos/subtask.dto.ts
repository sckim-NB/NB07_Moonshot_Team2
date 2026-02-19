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
export const toApiSubtaskStatus = (status: TaskStatus): SubtaskStatusDto => {
  if (status === 'TODO') return 'todo';
  if (status === 'IN_PROGRESS') return 'in_progress';
  return 'done';
};

// API(string) -> DB(enum) 변환
export const toDbSubtaskStatus = (status: SubtaskStatusDto): TaskStatus => {
  if (status === 'todo') return 'TODO';
  if (status === 'in_progress') return 'IN_PROGRESS';
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
