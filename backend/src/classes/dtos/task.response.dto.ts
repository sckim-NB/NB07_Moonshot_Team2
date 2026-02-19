export class TaskResponseDto {
  id!: string;
  projectId!: string;
  title!: string;
  startYear!: number | null;
  startMonth!: number | null;
  startDay!: number | null;
  endYear!: number | null;
  endMonth!: number | null;
  endDay!: number | null;
  status!: 'todo' | 'in_progress' | 'done';
  assignee!: {
    id: string;
    name: string;
    email: string;
    profileImage: string;
  } | null;
  tags!: { id: string; name: string }[];
  attachments!: string[];
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<TaskResponseDto>) {
    Object.assign(this, partial);
  }
}
export class TaskListResponseDto {
  tasks!: TaskResponseDto[];
  totalCount!: number;

  constructor(partial: Partial<TaskListResponseDto>) {
    Object.assign(this, partial);
  }
}
