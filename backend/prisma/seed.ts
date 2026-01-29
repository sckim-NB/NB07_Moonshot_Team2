import { PrismaClient, TaskStatus, MemberRole, InviteStatus } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 기존 데이터 삭제 (개발 환경에서만)
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.subtask.deleteMany();
  await prisma.taskTag.deleteMany();
  await prisma.task.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleared existing data');

  // 비밀번호 해싱
  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. 사용자 생성
  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      name: 'Alice',
      password: hashedPassword,
      profileImage: 'https://i.pravatar.cc/150?img=1',
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      name: 'Bob',
      password: hashedPassword,
      profileImage: 'https://i.pravatar.cc/150?img=2',
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'charlie@example.com',
      name: 'Charlie',
      password: hashedPassword,
      profileImage: 'https://i.pravatar.cc/150?img=3',
    },
  });

  console.log('✅ Created 3 users');

  // 2. 프로젝트 생성
  const project1 = await prisma.project.create({
    data: {
      name: 'Moonshot Project',
      description: '팀 협업 프로젝트 관리 플랫폼',
      ownerId: user1.id,
    },
  });

  const project2 = await prisma.project.create({
    data: {
      name: 'Marketing Campaign',
      description: '2026 마케팅 캠페인 기획',
      ownerId: user2.id,
    },
  });

  console.log('✅ Created 2 projects');

  // 3. 프로젝트 멤버 추가
  await prisma.projectMember.createMany({
    data: [
      {
        projectId: project1.id,
        userId: user1.id,
        role: MemberRole.OWNER,
        status: InviteStatus.ACCEPTED,
      },
      {
        projectId: project1.id,
        userId: user2.id,
        role: MemberRole.MEMBER,
        status: InviteStatus.ACCEPTED,
      },
      {
        projectId: project1.id,
        userId: user3.id,
        role: MemberRole.MEMBER,
        status: InviteStatus.ACCEPTED,
      },
      {
        projectId: project2.id,
        userId: user2.id,
        role: MemberRole.OWNER,
        status: InviteStatus.ACCEPTED,
      },
      {
        projectId: project2.id,
        userId: user1.id,
        role: MemberRole.MEMBER,
        status: InviteStatus.ACCEPTED,
      },
    ],
  });

  console.log('✅ Created project members');

  // 4. 태그 생성
  const tagBackend = await prisma.tag.create({
    data: { name: 'Backend' },
  });

  const tagFrontend = await prisma.tag.create({
    data: { name: 'Frontend' },
  });

  const tagUrgent = await prisma.tag.create({
    data: { name: 'Urgent' },
  });

  const tagBug = await prisma.tag.create({
    data: { name: 'Bug' },
  });

  console.log('✅ Created 4 tags');

  // 5. 할 일(Task) 생성
  const task1 = await prisma.task.create({
    data: {
      title: 'API 설계 및 구현',
      description: 'RESTful API 엔드포인트 설계 및 구현',
      projectId: project1.id,
      assigneeId: user2.id,
      status: TaskStatus.IN_PROGRESS,
      startYear: 2026,
      startMonth: 1,
      startDay: 20,
      endYear: 2026,
      endMonth: 2,
      endDay: 10,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: '데이터베이스 스키마 설계',
      description: 'PostgreSQL 스키마 및 마이그레이션 작성',
      projectId: project1.id,
      assigneeId: user1.id,
      status: TaskStatus.DONE,
      startYear: 2026,
      startMonth: 1,
      startDay: 15,
      endYear: 2026,
      endMonth: 1,
      endDay: 25,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      title: 'UI/UX 디자인 시안 작성',
      description: 'Figma를 사용한 프로토타입 디자인',
      projectId: project1.id,
      assigneeId: user3.id,
      status: TaskStatus.TODO,
      startYear: 2026,
      startMonth: 2,
      startDay: 1,
      endYear: 2026,
      endMonth: 2,
      endDay: 15,
    },
  });

  const task4 = await prisma.task.create({
    data: {
      title: '로그인 버그 수정',
      description: 'JWT 토큰 만료 시 자동 로그아웃 이슈',
      projectId: project1.id,
      assigneeId: user2.id,
      status: TaskStatus.TODO,
      endYear: 2026,
      endMonth: 2,
      endDay: 5,
    },
  });

  console.log('✅ Created 4 tasks');

  // 6. TaskTag 연결
  await prisma.taskTag.createMany({
    data: [
      { taskId: task1.id, tagId: tagBackend.id },
      { taskId: task2.id, tagId: tagBackend.id },
      { taskId: task3.id, tagId: tagFrontend.id },
      { taskId: task4.id, tagId: tagBug.id },
      { taskId: task4.id, tagId: tagUrgent.id },
    ],
  });

  console.log('✅ Created task-tag relations');

  // 7. 하위 할 일(Subtask) 생성
  await prisma.subtask.createMany({
    data: [
      {
        taskId: task1.id,
        title: '인증 API 구현',
        status: TaskStatus.DONE,
        order: 1,
      },
      {
        taskId: task1.id,
        title: '프로젝트 CRUD API 구현',
        status: TaskStatus.IN_PROGRESS,
        order: 2,
      },
      {
        taskId: task1.id,
        title: '할 일 CRUD API 구현',
        status: TaskStatus.TODO,
        order: 3,
      },
      {
        taskId: task3.id,
        title: '와이어프레임 작성',
        status: TaskStatus.TODO,
        order: 1,
      },
      {
        taskId: task3.id,
        title: '컬러 팔레트 선정',
        status: TaskStatus.TODO,
        order: 2,
      },
    ],
  });

  console.log('✅ Created 5 subtasks');

  // 8. 댓글(Comment) 생성
  await prisma.comment.createMany({
    data: [
      {
        taskId: task1.id,
        userId: user1.id,
        content: 'API 문서도 함께 작성해 주세요!',
      },
      {
        taskId: task1.id,
        userId: user2.id,
        content: '네, Swagger로 문서화하겠습니다.',
      },
      {
        taskId: task2.id,
        userId: user2.id,
        content: '스키마 설계 잘 되었네요! 👍',
      },
      {
        taskId: task4.id,
        userId: user1.id,
        content: '이 버그 우선순위 높게 처리 부탁드립니다.',
      },
    ],
  });

  console.log('✅ Created 4 comments');

  // 9. 초대(Invitation) 생성
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7일 후 만료

  await prisma.invitation.create({
    data: {
      projectId: project1.id,
      inviterId: user1.id,
      inviteeEmail: 'david@example.com',
      status: InviteStatus.PENDING,
      expiresAt,
    },
  });

  console.log('✅ Created 1 invitation');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
