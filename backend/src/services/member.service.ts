import {
  BadRequestError,
  NotFoundError,
  InvalidRequestError,
  NotProjectMemberError,
  NotProjectOwnerError,
  UserNotFoundError,
} from '../lib/errors.js';
import { memberRepository } from '../repositories/member.repository.js';
import {
  toAcceptedMemberDto,
  toPendingInvitationDto,
  type MemberListResponseDto,
} from '../dtos/member.dto.js';

export const memberService = {
  // 멤버 조회
  async getProjectMembers(input: {
    projectId: string;
    requesterId: string;
    page: number;
    limit: number;
  }): Promise<MemberListResponseDto> {
    const { projectId, requesterId, page, limit } = input;

    const offset = (page - 1) * limit;

    // 권한 확인 (멤버)
    const isMember = await memberRepository.isAcceptedProjectMember(projectId, requesterId);
    if (!isMember) throw new NotProjectMemberError();

    // accepted + pending 조회
    const [accepted, pending] = await Promise.all([
      memberRepository.findAcceptedMembers(projectId),
      memberRepository.findPendingInvitations(projectId),
    ]);

    const assigneeIds = accepted.map((m) => m.user.id);
    const taskCountMap = await memberRepository.getTaskCountsByAssigneeIds(projectId, assigneeIds);

    // accepted + pending 정렬
    const merged = [
      ...accepted.map((m) => toAcceptedMemberDto(m, taskCountMap.get(m.user.id) ?? 0)),
      ...pending.map(toPendingInvitationDto),
    ];

    return {
      data: merged.slice(offset, offset + limit),
      total: merged.length,
    };
  },

  // 멤버 초대
  async inviteProjectMember(input: { projectId: string; requesterId: string; email: string }) {
    const { projectId, requesterId, email } = input;

    // 권한 확인 (오너)
    const isOwner = await memberRepository.isProjectOwner(projectId, requesterId);
    if (!isOwner) throw new NotProjectOwnerError();

    // 멤버 조회
    const targetUser = await memberRepository.findUserByEmail(email);
    if (!targetUser) throw new UserNotFoundError();

    // 본인 초대 x
    if (targetUser.id === requesterId) throw new InvalidRequestError();

    // 멤버 여부 확인
    const alreadyMember = await memberRepository.existsAcceptedMemberByUserId(
      projectId,
      targetUser.id
    );
    if (alreadyMember) throw new BadRequestError('이미 프로젝트 멤버입니다');

    // 중복 초대 x
    const existsPending = await memberRepository.existsPendingInvitation(projectId, email);
    if (existsPending) throw new BadRequestError('이미 초대된 이메일입니다');

    // 초대 생성
    const invitationId = await memberRepository.createInvitation({
      projectId,
      inviterId: requesterId,
      inviteeEmail: email,
    });

    return { invitationId };
  },

  // 초대 취소
  async removeInvitation(input: { invitationId: string; requesterId: string }) {
    const { invitationId, requesterId } = input;

    const inv = await memberRepository.findInvitationForDelete(invitationId);
    if (!inv) throw new NotFoundError('요청을 확인할 수 없습니다');

    if (inv.project.ownerId !== requesterId) throw new NotProjectOwnerError();

    if (inv.status !== 'PENDING') throw new InvalidRequestError();

    await memberRepository.deleteInvitation(invitationId);
  },
};
