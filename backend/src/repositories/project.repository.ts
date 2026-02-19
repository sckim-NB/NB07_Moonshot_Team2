import { prisma } from '../lib/db';

export async function createProject(data: {
  name: string;
  description?: string | null | undefined;
  ownerId: string;
}) {
  return await prisma.project.create({
    data: {
      name: data.name,
      description: data.description,
      ownerId: data.ownerId,
    },
  });
}

export async function addProjectMember(
  projectId: string,
  userId: string,
  role: 'OWNER' | 'MEMBER'
) {
  return await prisma.projectMember.create({
    data: {
      projectId,
      userId,
      role,
      status: 'ACCEPTED',
    },
  });
}

export async function getProject(projectId: string) {
  return await prisma.project.findUnique({
    where: { id: projectId },
  });
}

export async function updateProject(
  projectId: string,
  data: { name?: string | undefined; description?: string | null | undefined }
) {
  return await prisma.project.update({
    where: { id: projectId },
    data: {
      name: data.name,
      description: data.description,
    },
  });
}

export async function deleteProject(projectId: string) {
  return await prisma.project.delete({
    where: { id: projectId },
  });
}

export async function projectOwnerCount(ownerId: string) {
  return await prisma.project.count({
    where: { ownerId },
  });
}

export async function projectMemberCount(projectId: string) {
  return await prisma.projectMember.count({
    where: { projectId },
  });
}

export async function todoCount(projectId: string) {
  return await prisma.task.count({
    where: {
      projectId: projectId,
      status: 'TODO',
    },
  });
}

export async function inProgressCount(projectId: string) {
  return await prisma.task.count({
    where: {
      projectId: projectId,
      status: 'IN_PROGRESS',
    },
  });
}

export async function doneCount(projectId: string) {
  return await prisma.task.count({
    where: {
      projectId: projectId,
      status: 'DONE',
    },
  });
}
