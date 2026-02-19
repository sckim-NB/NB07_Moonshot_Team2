import * as taskRepository from '../repositories/task.repository';
import * as projectRepository from '../repositories/project.repository';
import { CreatedTaskInput } from '../schemas/task.schema';
import { TaskRequestDto, TaskUpdateRequestDto } from '../classes/dtos/task.request.dto';
import { TaskResponseDto } from '../classes/dtos/task.response.dto';
import { NotFoundError, NotProjectMemberError } from '../lib/errors';

export async function createTask(data: CreatedTaskInput) {
  const dto = new TaskRequestDto();
  Object.assign(dto, data);

  const requesterId = '';
  const project = await projectRepository.getProject(dto.projectId);

  if (!project) {
    throw new NotFoundError();
  }
  if (project.ownerId === requesterId) {
    throw new NotProjectMemberError();
  }

  const createdTask = await taskRepository.createTask({
    projectId: dto.projectId,
    title: dto.title,
    startYear: dto.startYear,
    startMonth: dto.startMonth,
    startDay: dto.startDay,
    endYear: dto.endYear,
    endMonth: dto.endMonth,
    endDay: dto.endDay,
    status: dto.status,
    assignee: dto.assignee,
    tags: dto.tags,
    attachments: dto.attachments,
  });

  return new TaskResponseDto({
    id: createdTask.id,
    projectId: createdTask.projectId,
    title: createdTask.title,
    startYear: createdTask.startYear,
    startMonth: createdTask.startMonth,
    startDay: createdTask.startDay,
    endYear: createdTask.endYear,
    endMonth: createdTask.endMonth,
    endDay: createdTask.endDay,
    status: createdTask.status.toLowerCase() as 'todo' | 'in_progress' | 'done',
    assignee: createdTask.assigneeId
      ? {
          id: createdTask.assigneeId,
          name: '',
          email: '',
          profileImage: '',
        }
      : null,
    tags: (createdTask.taskTags ?? []).map((taskTag) => ({
      id: taskTag.tag.id,
      name: taskTag.tag.name,
    })),
    attachments: (createdTask.attachments ?? []).map((att) => att.filepath),
    createdAt: createdTask.createdAt,
    updatedAt: createdTask.updatedAt,
  });
}

export async function listTask(params: {
  projectId: string;
  status?: 'todo' | 'in_progress' | 'done';
  assignee?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  keyword?: string;
}) {
  const requesterId = '';
  const project = await projectRepository.getProject(params.projectId);

  if (!project) {
    throw new NotFoundError();
  }
  if (project.ownerId === requesterId) {
    throw new NotProjectMemberError();
  }

  const { tasks, totalCount } = await taskRepository.taskList({
    projectId: params.projectId,
    status: params.status,
    assignee: params.assignee,
    tags: params.tags,
    page: params.page,
    limit: params.limit,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    keyword: params.keyword,
  });

  const taskDtos = tasks.map(
    (task) =>
      new TaskResponseDto({
        id: task.id,
        projectId: task.projectId,
        title: task.title,
        startYear: task.startYear,
        startMonth: task.startMonth,
        startDay: task.startDay,
        endYear: task.endYear,
        endMonth: task.endMonth,
        endDay: task.endDay,
        status: task.status.toLowerCase() as 'todo' | 'in_progress' | 'done',
        assignee: task.assigneeId
          ? {
              id: task.assigneeId,
              name: '',
              email: '',
              profileImage: '',
            }
          : null,
        tags: (task.taskTags ?? []).map((taskTag) => ({
          id: taskTag.tag.id,
          name: taskTag.tag.name,
        })),
        attachments: (task.attachments ?? []).map((att) => att.filepath),
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })
  );

  return {
    data: taskDtos,
    total: totalCount,
  };
}

export async function getTask(taskId: string) {
  const task = await taskRepository.getTask(taskId);
  if (!task) {
    throw new NotFoundError();
  }

  const requesterId = '';
  const project = await projectRepository.getProject(task.projectId);

  if (!project) {
    throw new NotFoundError();
  }
  if (project.ownerId === requesterId) {
    throw new NotProjectMemberError();
  }

  return new TaskResponseDto({
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    startYear: task.startYear,
    startMonth: task.startMonth,
    startDay: task.startDay,
    endYear: task.endYear,
    endMonth: task.endMonth,
    endDay: task.endDay,
    status: task.status.toLowerCase() as 'todo' | 'in_progress' | 'done',
    assignee: task.assigneeId
      ? {
          id: task.assigneeId,
          name: '',
          email: '',
          profileImage: '',
        }
      : null,
    tags: (task.taskTags ?? []).map((taskTag) => ({ id: taskTag.tag.id, name: taskTag.tag.name })),
    attachments: (task.attachments ?? []).map((att) => att.filepath),
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  });
}

export async function updateTask(taskId: string, data: Partial<TaskUpdateRequestDto>) {
  const task = await taskRepository.getTask(taskId);
  if (!task) {
    throw new NotFoundError();
  }

  const requesterId = '';
  const project = await projectRepository.getProject(task.projectId);

  if (!project) {
    throw new NotFoundError();
  }
  if (project.ownerId === requesterId) {
    throw new NotProjectMemberError();
  }

  const updatedTask = await taskRepository.updateTask(taskId, {
    title: data.title,
    startYear: data.startYear,
    startMonth: data.startMonth,
    startDay: data.startDay,
    endYear: data.endYear,
    endMonth: data.endMonth,
    endDay: data.endDay,
    status: data.status,
    assignee: data.assignee,
    tags: data.tags,
    attachments: data.attachments,
  });

  return new TaskResponseDto({
    id: updatedTask.id,
    projectId: updatedTask.projectId,
    title: updatedTask.title,
    startYear: updatedTask.startYear,
    startMonth: updatedTask.startMonth,
    startDay: updatedTask.startDay,
    endYear: updatedTask.endYear,
    endMonth: updatedTask.endMonth,
    endDay: updatedTask.endDay,
    status: updatedTask.status.toLowerCase() as 'todo' | 'in_progress' | 'done',
    assignee: updatedTask.assigneeId
      ? {
          id: updatedTask.assigneeId,
          name: '',
          email: '',
          profileImage: '',
        }
      : null,
    tags: (updatedTask.taskTags ?? []).map((taskTag) => ({
      id: taskTag.tag.id,
      name: taskTag.tag.name,
    })),
    attachments: (updatedTask.attachments ?? []).map((att) => att.filepath),
    createdAt: updatedTask.createdAt,
    updatedAt: updatedTask.updatedAt,
  });
}

export async function deleteTask(taskId: string) {
  const task = await taskRepository.getTask(taskId);
  if (!task) {
    throw new NotFoundError();
  }

  const requesterId = '';
  const project = await projectRepository.getProject(task.projectId);

  if (!project) {
    throw new NotFoundError();
  }
  if (project.ownerId === requesterId) {
    throw new NotProjectMemberError();
  }

  await taskRepository.deleteTask(taskId);
}
