import { prisma } from '../lib/db.js';

export const subtaskRepository = {
  // 할 일 조회 projectId 확보
  async findTaskProjectId(taskId: string) {
    return prisma.task.findUnique({
      where: { id: taskId },
      select: { projectId: true },
    });
  },

  // 권한 확인 (멤버)
  async isAcceptedProjectMember(projectId: string, userId: string) {
    const found = await prisma.projectMember.findFirst({
      where: { projectId, userId, status: 'ACCEPTED' },
      select: { id: true },
    });
    return Boolean(found);
  },

  // 생성된 subtask 맨 아래로
  async findMaxSubtaskOrder(taskId: string) {
    const agg = await prisma.subtask.aggregate({
      where: { taskId },
      _max: { order: true },
    });

    return agg._max.order ?? null;
  },

  // subtask 생성
  async createSubtask(input: { taskId: string; title: string; order: number }) {
    return prisma.subtask.create({
      data: {
        taskId: input.taskId,
        title: input.title,
        order: input.order,
      },
      select: {
        id: true,
        taskId: true,
        title: true,
        status: true,
        order: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  // subtask 목록 조회
  async findSubtasks(taskId: string) {
    return prisma.subtask.findMany({
      where: { taskId },
      orderBy: [{ status: 'asc' }, { order: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        taskId: true,
        title: true,
        status: true,
        order: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  // subtask 조회
  async findSubtaskById(subtaskId: string) {
    return prisma.subtask.findUnique({
      where: { id: subtaskId },
      select: {
        id: true,
        taskId: true,
        title: true,
        status: true,
        order: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  // subtask 수정
  async updateSubtask(
    subtaskId: string,
    data: { title?: string; status?: 'TODO' | 'IN_PROGRESS' | 'DONE' }
  ) {
    return prisma.subtask.update({
      where: { id: subtaskId },
      data,
      select: {
        id: true,
        taskId: true,
        title: true,
        status: true,
        order: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  // subtask 삭제
  async deleteSubtask(subtaskId: string) {
    return prisma.subtask.delete({
      where: { id: subtaskId },
      select: { id: true },
    });
  },
};
