type InviteStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED';

export type MemberListItemDto = {
  id: string | null;
  name: string;
  email: string;
  profileImage: string | null;
  taskCount: number;
  status: 'pending' | 'accepted' | 'rejected';
  invitationId: string | null;
};

export type MemberListResponseDto = {
  data: MemberListItemDto[];
  total: number;
};

// status 매핑
export const mapMemberStatus = (s: InviteStatus): MemberListItemDto['status'] => {
  if (s === 'PENDING') return 'pending';
  if (s === 'ACCEPTED') return 'accepted';
  return 'rejected';
};

// ACCEPTED 멤버
export const toAcceptedMemberDto = (
  m: {
    user: { id: string; name: string; email: string; profileImage: string | null };
    status: InviteStatus;
  },
  taskCount: number
): MemberListItemDto => ({
  id: m.user.id,
  name: m.user.name,
  email: m.user.email,
  profileImage: m.user.profileImage,
  taskCount,
  status: mapMemberStatus(m.status),
  invitationId: null,
});

// PENDING 초대
export const toPendingInvitationDto = (inv: {
  id: string;
  inviteeEmail: string;
  status: InviteStatus;
  user: { id: string; name: string; profileImage: string | null } | null;
}): MemberListItemDto => ({
  id: inv.user?.id ?? null,
  name: inv.user?.name ?? inv.inviteeEmail,
  email: inv.inviteeEmail,
  profileImage: inv.user?.profileImage ?? null,
  taskCount: 0,
  status: mapMemberStatus(inv.status),
  invitationId: inv.id,
});
