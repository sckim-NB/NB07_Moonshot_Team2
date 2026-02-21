'use server';

import * as api from '@/shared/api';
import ActionResult from '@/types/ActionResult';
import { Project, Task } from '@/types/entities';
import { revalidatePath } from 'next/cache';

interface CreateTaskInput {
  projectId: string;
  title: string;
  description: string;
  startYear: number;
  startMonth: number;
  startDay: number;
  endYear: number;
  endMonth: number;
  endDay: number;
  tags: string[];
  attachments: string[];
  status?: string; 
  assignee?: string | null;
}

export const createTask = async (
  payload: CreateTaskInput
): Promise<ActionResult<Task>> => {
  try {
    const finalPayload = {
      ...payload,
      status: 'todo',             // 기본값 강제 주입
      assignee: null,             // 기본값 강제 주입
      tags: payload.tags || [],
      attachments: payload.attachments || [],
    };
    console.log("🚀 백엔드로 보내는 페이로드:", finalPayload);
    const task = await api.createTask(finalPayload);
    revalidatePath(`/projects/${payload.projectId}/tasks`);
    return {
      success: '할 일 생성 성공',
      data: task,
      error: null,
    };
  } catch (error) {
    return {
      success: null,
      error:
        error instanceof Error
          ? error.message
          : '할 일 생성 중 오류가 발생했습니다.',
      data: null,
    };
  }
};

interface UpdateProjectInput {
  name?: string;
  description?: string;
}

export const updateProject = async (
  projectId: string,
  payload: UpdateProjectInput
): Promise<ActionResult<Project>> => {
  try {
    const project = await api.updateProject(projectId, payload);
    revalidatePath(`/projects/${projectId}`);
    return {
      success: '프로젝트 수정 성공',
      data: project,
      error: null,
    };
  } catch (error) {
    return {
      success: null,
      error:
        error instanceof Error
          ? error.message
          : '프로젝트 수정 중 오류가 발생했습니다.',
      data: null,
    };
  }
};

export const deleteProject = async (
  projectId: string
): Promise<ActionResult<null>> => {
  try {
    await api.deleteProject(projectId);
    revalidatePath('/projects');
    return {
      success: '프로젝트 삭제 성공',
      data: null,
      error: null,
    };
  } catch (error) {
    return {
      success: null,
      error:
        error instanceof Error
          ? error.message
          : '프로젝트 삭제 중 오류가 발생했습니다.',
      data: null,
    };
  }
};

export const inviteMember = async (
  projectId: string,
  email: string
): Promise<ActionResult<null>> => {
  try {
    await api.inviteMember(projectId, email);
    revalidatePath(`/projects/${projectId}/users`);
    return {
      success: '멤버 초대 성공',
      data: null,
      error: null,
    };
  } catch (error) {
    return {
      success: null,
      error:
        error instanceof Error
          ? error.message
          : '멤버 초대 중 오류가 발생했습니다.',
      data: null,
    };
  }
};
