// src/dtos/user.dto.ts
import { User, Project, Task, TaskTag, Tag, Attachment } from '@prisma/client';

// 유저 정보 수정 시 사용하는 데이터 구조
export interface UpdateUserDto {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
  profileImage?: string | null;
}

// 유저 프로젝트 목록 조회 시 쿼리 파라미터 타입
export interface GetProjectsQuery {
  page?: string;
  limit?: string;
  order?: 'asc' | 'desc';
  order_by?: 'name' | 'created_at';
}

// 유저 할 일 목록 조회 시 쿼리 파라미터 타입
export interface GetTasksQuery {
  page?: string;
  limit?: string;
  order?: 'asc' | 'desc';
}

// 상세 정보를 포함한 할 일 데이터 타입
export type TaskWithDetails = Task & {
  project: Pick<Project, 'id' | 'name'>;
  assignee: Pick<User, 'id' | 'name' | 'email' | 'profileImage'> | null;
  taskTags: (TaskTag & { tag: Tag })[];
  attachments: Attachment[];
};

//통계 정보를 포함한 프로젝트 데이터 타입
export interface ProjectWithCounts {
  id: string | number;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    members: number;
    tasks: number;
  };
  tasks: { status: string }[];
}
