export class TaskRequestDto {
  projectId!: string;
  title!: string;
  startYear!: number;
  startMonth!: number;
  startDay!: number;
  endYear!: number;
  endMonth!: number;
  endDay!: number;
  status!: 'todo' | 'in_progress' | 'done';
  assignee!: string | null;
  tags!: string[];
  attachments!: string[];
}
export class TaskUpdateRequestDto {
  title?: string;
  startYear?: number;
  startMonth?: number;
  startDay?: number;
  endYear?: number;
  endMonth?: number;
  endDay?: number;
  status?: 'todo' | 'in_progress' | 'done';
  assignee?: string | null;
  tags?: string[];
  attachments?: string[];
}

export default { TaskRequestDto, TaskUpdateRequestDto };
