import { NotProjectMemberError } from '../lib/errors.js';
import { memberRepository } from '../repositories/member.repository.js';

const mapStatus = (s: 'PENDING' | 'ACCEPTED' | 'DECLINED') => {
  if (s === 'PENDING') return 'pending';
  if (s === 'ACCEPTED') return 'accepted';
  return 'rejected';
};

export const memberService = {
  async getProjectMembers(input: {
    projectId: string;
    requesterId: string;
    page: number;
    limit: number;
  }) {
    const { projectId, requesterId, page, limit } = input;
    const offset = (page - 1) * limit;

    // 권한 체크
    const isMember = await memberRepository.isAcceptedProjectMember(projectId, requesterId);
    if (!isMember) throw new NotProjectMemberError();

    // accepted + pending 조회
    const accepted = await memberRepository.findAcceptedMembers(projectId);
    const pending = await memberRepository.findPendingInvitations(projectId);

    // accepted 멤버 taskCount 집계
    const acceptedUserIds = accepted.map((m) => m.userId);
    const taskCountMap = await memberRepository.countTasksByAssignee(projectId, acceptedUserIds);

    const acceptedDto = accepted.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      email: m.user.email,
      profileImage: m.user.profileImage,
      taskCount: taskCountMap.get(m.userId) ?? 0,
      status: mapStatus(m.status),
      invitationId: null,
    }));

    const pendingDto = pending.map((inv) => ({
      id: inv.user?.id ?? null,
      name: inv.user?.name ?? inv.inviteeEmail,
      email: inv.inviteeEmail,
      profileImage: inv.user?.profileImage ?? null,
      taskCount: 0,
      status: mapStatus(inv.status),
      invitationId: inv.id, 
    }));

    // 정렬 고정: accepted + pending 
    const merged = [...acceptedDto, ...pendingDto];
    const total = merged.length;
    const data = merged.slice(offset, offset + limit);

    return { data, total };
  },
};
