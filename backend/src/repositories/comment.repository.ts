import { prisma } from '../lib/db';

export async function createComment(data: { content: string; userId: string; taskId: string }) {
  return await prisma.comment.create({
    data: {
      content: data.content,
      userId: data.userId,
      taskId: data.taskId,
    },
    include: {
      user: true, // 생성된 댓글과 함께 유저 정보를 즉시 반환
    },
  });
}

export async function listComments(params: { page: number; pageSize: number; taskId: string }) {
  const comments = await prisma.comment.findMany({
    where: { taskId: params.taskId },
    orderBy: { createdAt: 'asc' },
    skip: (params.page - 1) * params.pageSize,
    take: params.pageSize,
    include: {
      user: true,
    },
  });

  const totalCount = await prisma.comment.count({
    where: { taskId: params.taskId },
  });

  return { comments, totalCount };
}

export async function totalCommentsCount(taskId: string) {
  return await prisma.comment.count({
    where: { taskId: taskId },
  });
}

export async function getComment(commentId: string) {
  // ID가 없으면 조회를 시도하지 않도록 방어 코드 추가
  if (!commentId) return null;
  return await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      task: true,
    },
  });
}

export async function updateComment(commentId: string, data: { content: string | undefined }) {
  return await prisma.comment.update({
    where: { id: commentId },
    data: {
      content: data.content,
    },
  });
}

export async function deleteComment(commentId: string) {
  return await prisma.comment.delete({
    where: { id: commentId },
  });
}

export async function getCommentProjectId(commentId: string) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      task: {
        select: {
          projectId: true,
        },
      },
    },
  });

  return comment?.task.projectId;
}
