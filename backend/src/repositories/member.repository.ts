import { prisma } from '../lib/db.js';

export const memberRepository = {
  // 참여 멤버 확인
  async isAcceptedProjectMember(projectId: string, userId: string) {
    const found = await prisma.projectMember.findFirst({
      where: { projectId, userId, status: 'ACCEPTED' },
      select: { id: true },
    });
    return Boolean(found);
  },

  // 멤버 목록 조회
  async findAcceptedMembers(projectId: string) {
    return prisma.projectMember.findMany({
      where: { projectId, status: 'ACCEPTED' },
      include: { user: true },
      orderBy: { joinedAt: 'asc' },
    });
  },

  // 초대 목록 조회
  async findPendingInvitations(projectId: string) {
    const invitations = await prisma.invitation.findMany({
      where: { projectId, status: 'PENDING' },
      select: { id: true, inviteeEmail: true, status: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });

    const emails = invitations.map((i) => i.inviteeEmail);
    if (emails.length === 0) {
      return invitations.map((inv) => ({ ...inv, user: null }));
    }

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

  // 멤버별 task 개수 조회
  async getTaskCountsByAssigneeIds(projectId: string, assigneeIds: string[]) {
    if (assigneeIds.length === 0) {
      return new Map<string, number>();
    }

    const rows = await prisma.task.groupBy({
      by: ['assigneeId'],
      where: {
        projectId,
        assigneeId: { in: assigneeIds },
      },
      _count: { _all: true },
    });

    // assigneeId -> taskCount
    const taskCountMap = new Map<string, number>();
    rows.forEach((row) => {
      taskCountMap.set(row.assigneeId!, row._count._all);
    });

    return taskCountMap;
  },

  // 권한 확인 (오너)
  async isProjectOwner(projectId: string, userId: string) {
    const found = await prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
      select: { id: true },
    });
    return Boolean(found);
  },

  // 가입 유저 조회
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });
  },

  // 멤버 체크
  async existsAcceptedMemberByUserId(projectId: string, userId: string) {
    return this.isAcceptedProjectMember(projectId, userId);
  },

  // 중복 초대 x
  async existsPendingInvitation(projectId: string, inviteeEmail: string) {
    const found = await prisma.invitation.findFirst({
      where: { projectId, inviteeEmail, status: 'PENDING' },
      select: { id: true },
    });
    return Boolean(found);
  },

  // 초대 생성
  async createInvitation(input: { projectId: string; inviterId: string; inviteeEmail: string }) {
    const created = await prisma.invitation.create({
      data: {
        projectId: input.projectId,
        inviterId: input.inviterId,
        inviteeEmail: input.inviteeEmail,
        status: 'PENDING',
        expiresAt: new Date('9999-12-31T23:59:59.999Z'),
      },
      select: { id: true },
    });

    return created.id;
  },

  // 초대 취소 조회
  async findInvitationForDelete(invitationId: string) {
    return prisma.invitation.findUnique({
      where: { id: invitationId },
      select: {
        id: true,
        status: true,
        project: { select: { ownerId: true } },
      },
    });
  },

  // 초대 취소
  async deleteInvitation(invitationId: string) {
    await prisma.invitation.delete({ where: { id: invitationId } });
  },

  // 초대 조회
  async findInvitationById(invitationId: string) {
    return prisma.invitation.findUnique({
      where: { id: invitationId },
      select: {
        id: true,
        projectId: true,
        inviteeEmail: true,
        status: true,
        expiresAt: true,
      },
    });
  },

  // 수락 요청자 이메일 조회
  async findRequesterEmailById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
  },

  // 중복 수락 요청 x
  async findProjectMember(projectId: string, userId: string) {
    return prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId } },
      select: {
        id: true,
        projectId: true,
        userId: true,
        role: true,
        status: true,
      },
    });
  },

  // 초대 상태 업데이트
  async markInvitationAcceptedIfPending(invitationId: string) {
    return prisma.invitation.updateMany({
      where: { id: invitationId, status: 'PENDING' },
      data: { status: 'ACCEPTED' },
    });
  },

  // 멤버 생성
  async createProjectMember(projectId: string, userId: string) {
    return prisma.projectMember.create({
      data: { projectId, userId },
      select: {
        id: true,
        projectId: true,
        userId: true,
        role: true,
        status: true,
      },
    });
  },

  // 담당자 제외시 해당 할일 삭제
  async deleteTasksByAssigneeInProject(projectId: string, assigneeId: string) {
    return prisma.task.deleteMany({
      where: { projectId, assigneeId },
    });
  },

  // 멤버 삭제
  async deleteProjectMember(projectId: string, userId: string) {
    return prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } },
      select: { id: true },
    });
  },
};
