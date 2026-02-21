import { prisma } from '../lib/db';
import type { Prisma, TaskStatus } from '@prisma/client';

export async function createTask(data: {
  projectId: string;
  title: string;
  startYear: number;
  startMonth: number;
  startDay: number;
  endYear: number;
  endMonth: number;
  endDay: number;
  status: 'todo' | 'in_progress' | 'done';
  assignee: string | null;
  tags: string[];
  attachments: string[];
}) {
  const createData = {
    // 🚨 projectId: data.projectId 대신 아래와 같이 '관계'로 연결합니다.
    project: {
      connect: { id: data.projectId },
    },
    title: data.title,
    startYear: data.startYear,
    startMonth: data.startMonth,
    startDay: data.startDay,
    endYear: data.endYear,
    endMonth: data.endMonth,
    endDay: data.endDay,
    status: data.status.toUpperCase() as unknown as TaskStatus,
    ...(data.assignee ? { assignee: { connect: { id: data.assignee } } } : {}),
    taskTags: {
      create: data.tags.map((tagName) => ({
        tag: {
          connectOrCreate: {
            where: { name: tagName },
            create: { name: tagName },
          },
        },
      })),
    },
    attachments: {
      create: data.attachments.map((url) => ({
        url,
        filename: url.split('/').pop() || 'unknown',
        filepath: url,
        mimetype: 'application/octet-stream',
        size: 0,
      })),
    },
  } as unknown as Prisma.TaskCreateInput;

  return await prisma.task.create({
    data: createData,
    include: {
      taskTags: {
        include: {
          tag: true,
        },
      },
      attachments: true,
    },
  });
}

export async function taskList(params: {
  projectId: string;
  status?: 'todo' | 'in_progress' | 'done';
  assignee?: string;
  tags?: string[];
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'name' | 'end_date'; // 정렬 기준 추가
  sortOrder?: 'asc' | 'desc';
  keyword?: string;
}) {
  let orderBy: Prisma.TaskOrderByWithRelationInput | Prisma.TaskOrderByWithRelationInput[];
  const sortOrder = params.sortOrder ?? 'desc';

  if (params.sortBy === 'end_date') {
    orderBy = [{ endYear: sortOrder }, { endMonth: sortOrder }, { endDay: sortOrder }];
  } else if (params.sortBy === 'name') {
    orderBy = { title: sortOrder };
  } else {
    orderBy = { createdAt: sortOrder };
  }

  const whereClause: Prisma.TaskWhereInput = {
    projectId: params.projectId,
    ...(params.status ? { status: params.status.toUpperCase() as unknown as TaskStatus } : {}),
    ...(params.assignee ? { assigneeId: String(params.assignee) } : {}),
    ...(params.tags && params.tags.length > 0
      ? {
          taskTags: {
            some: {
              tag: {
                name: { in: params.tags },
              },
            },
          },
        }
      : {}),

    ...(params.keyword
      ? {
          title: {
            contains: params.keyword,
            mode: 'insensitive',
          },
        }
      : {}),
  };

  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const offset = (page - 1) * limit;

  const [tasks, totalCount] = await Promise.all([
    prisma.task.findMany({
      where: whereClause,
      skip: offset,
      take: limit,
      include: {
        taskTags: {
          include: {
            tag: true,
          },
        },
        attachments: true,
      },
      orderBy: orderBy,
    }),
    prisma.task.count({
      where: whereClause,
    }),
  ]);

  return { tasks, totalCount };
}

export async function countTasks(params: {
  projectId: string;
  status?: 'todo' | 'in_progress' | 'done';
  assignee?: string;
  tags?: string[];
  keyword?: string;
}) {
  const whereClause: Prisma.TaskWhereInput = {
    projectId: params.projectId,
    ...(params.status ? { status: params.status.toUpperCase() as unknown as TaskStatus } : {}),
    ...(params.assignee ? { assigneeId: params.assignee } : {}),
    ...(params.tags && params.tags.length > 0
      ? {
          taskTags: {
            some: {
              tag: {
                name: { in: params.tags },
              },
            },
          },
        }
      : {}),
    ...(params.keyword
      ? {
          title: {
            contains: params.keyword,
            mode: 'insensitive',
          },
        }
      : {}),
  };

  return await prisma.task.count({
    where: whereClause,
  });
}

export async function getTask(taskId: string) {
  return await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      taskTags: {
        include: {
          tag: true,
        },
      },
      attachments: true,
      comments: {
        include: {
          user: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      },
    },
  });
}

export async function updateTask(
  taskId: string,
  data: Partial<{
    title: string;
    startYear: number;
    startMonth: number;
    startDay: number;
    endYear: number;
    endMonth: number;
    endDay: number;
    status: 'todo' | 'in_progress' | 'done';
    assignee: string | null;
    tags: string[];
    attachments: string[];
  }>
) {
  const updateData: Prisma.TaskUpdateInput = {
    ...(data.title !== undefined ? { title: data.title } : {}),
    ...(data.startYear !== undefined ? { startYear: data.startYear } : {}),
    ...(data.startMonth !== undefined ? { startMonth: data.startMonth } : {}),
    ...(data.startDay !== undefined ? { startDay: data.startDay } : {}),
    ...(data.endYear !== undefined ? { endYear: data.endYear } : {}),
    ...(data.endMonth !== undefined ? { endMonth: data.endMonth } : {}),
    ...(data.endDay !== undefined ? { endDay: data.endDay } : {}),
    ...(data.status !== undefined
      ? { status: data.status.toUpperCase() as unknown as TaskStatus }
      : {}),
    ...(data.assignee !== undefined ? { assigneeId: data.assignee } : {}),
    ...(data.tags !== undefined
      ? {
          taskTags: {
            deleteMany: {},
            create: data.tags.map((tagName) => ({
              tag: {
                connectOrCreate: {
                  where: { name: tagName },
                  create: { name: tagName },
                },
              },
            })),
          },
        }
      : {}),
    ...(data.attachments !== undefined
      ? {
          attachments: {
            deleteMany: {},
            create: data.attachments.map((url) => ({
              url,
              filename: url.split('/').pop() || 'unknown',
              filepath: url,
              mimetype: 'application/octet-stream',
              size: 0,
            })),
          },
        }
      : {}),
  };

  return await prisma.task.update({
    where: { id: taskId },
    data: updateData,
    include: {
      taskTags: {
        include: {
          tag: true,
        },
      },
      attachments: true,
    },
  });
}

export async function deleteTask(taskId: string) {
  return await prisma.task.delete({
    where: { id: taskId },
  });
}
