import { TaskStatus } from './TaskStatus';
import UserProjectStatus from './UserProjectStatus';

interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends BaseEntity {
  email: string;
  name: string;
  profileImage: string | null;
}

export interface UserProject extends BaseEntity {
  userId: number;
  projectId: string;
  role: string;
  user?: User;
  status: UserProjectStatus;
  invitationId: string | null;
}

export interface UserWithCounts extends User {
  taskCount: number;
  status: UserProjectStatus;
  invitationId: string | null;
}

export interface ProjectWithCounts extends Project {
  memberCount: number;
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
}

export interface Tag extends BaseEntity {
  id: string;
  name: string;
}

export interface Attachment {
  id: number;
  url: string;
}

export interface SubTask extends BaseEntity {
  title: string;
  taskId: string;
  status: TaskStatus;
}

export interface Comment extends BaseEntity {
  content: string;
  taskId: string;
  author?: User;
}

interface TaskBase extends BaseEntity {
  projectId: string;
  title: string;
  description?: string;
  startYear: number;
  startMonth: number;
  startDay: number;
  endYear: number;
  endMonth: number;
  endDay: number;
}

export interface Project extends BaseEntity {
  id: string;
  name: string;
  description: string;
  members?: User[];
}

export interface Task extends TaskBase {
  status: TaskStatus;
  assignee: User | null;
  tags: Tag[];
  attachments?: string[];
  comments?: Comment[];
  subTasks?: SubTask[];
}

export interface TaskPayload extends TaskBase {
  status: TaskStatus;
  assignee?: string;
  tags: string[];
  attachments?: string[];
}

export type UpdateTaskPayload = Partial<TaskPayload>;
