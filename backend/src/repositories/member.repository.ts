import {prisma} from '../lib/db.js';

export const memberRepository = {
  async isAcceptedProjectMember(projectId: string, userId: string) {
    const found = await prisma.projectMember.findFirst({
      where: { projectId, userId, status: 'ACCEPTED' },
      select: { id: true },
    });
    return Boolean(found);
  },

  async findAcceptedMembers(projectId: string) {
    return prisma.projectMember.findMany({
      where: { projectId, status: 'ACCEPTED' },
      include: { user: true },
      orderBy: { joinedAt: 'asc' },
    });
  },

  async findPendingInvitations(projectId: string) {
    const invitations = await prisma.invitation.findMany({
      where: { projectId, status: 'PENDING' },
      select: { id: true, inviteeEmail: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    const emails = invitations.map((i) => i.inviteeEmail);
    const users = await prisma.user.findMany({
      where: { email: { in: emails } },
      select: { id: true, email: true, name: true, profileImage: true },
    });
    const userMap = new Map(users.map((u) => [u.email, u]));

    return invitations.map((inv) => ({
      ...inv,
      user: userMap.get(inv.inviteeEmail) ?? null,
    }));
  },

  async countTasksByAssignee(projectId: string, assigneeIds: string[]) {
    if (assigneeIds.length === 0) return new Map<string, number>();

    const grouped = await prisma.task.groupBy({
      by: ['assigneeId'],
      where: { projectId, assigneeId: { in: assigneeIds } },
      _count: { _all: true },
    });

    return new Map(grouped.map((g) => [g.assigneeId, g._count._all]));
  },
};
