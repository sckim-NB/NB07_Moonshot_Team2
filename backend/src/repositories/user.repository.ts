import { Provider, Prisma } from '@prisma/client';
import { prisma } from '../lib/db.js';

export class UserRepository {
    // #21 유저 - 내 정보 조회
     async findById(id: string){
          return await prisma.user.findUnique({
               where:{ id },
               select:{
                    id: true,
                    email: true,
                    name: true,
                    profileImage: true,
                    createdAt: true,
                    updatedAt: true
               }
          })
     }
     // #22 유저 - 내 정보 수정
    async findRawById(id: string) {
    return await prisma.user.findUnique({ where: { id } });
    }
     async update(id: string, data: { name?: string; password?: string; profileImage?: string | null }) {
     return await prisma.user.update({
      where: { id },
      data,
      select: { // 응답 명세에 맞는 필드만 선택
        id: true,
        email: true,
        name: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });
}
      // #23 유저 - 참여 중인 프로젝트 조회
    async findUserProjects(userId: string, params: {
    skip: number;
    take: number;
    orderBy: Prisma.ProjectOrderByWithRelationInput;
  }) {

    const [projects, total] = await prisma.$transaction([
      prisma.project.findMany({
        where: {
          members: { some: { userId } } //
        },
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy,
        include: {
          _count: {
            select: {
              members: true, // memberCount
              tasks: true,   // 전체 태스크 (상태별 카운트를 위해 필요 시 가공)
            }
          },
          // 상태별 개수는 Task 테이블의 status 필드를 기준으로 count 해야 합니다.
          tasks: {
            select: { status: true }
          }
        }
      }),
      prisma.project.count({
        where: { members: { some: { userId } } }
      })
    ]);

    return { projects, total };
  }
      // #24 유저 - 참여 중인 모든 프로젝트의 할 일 목록 조회
}

export const findByEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: { email },
  });
};

export const create = async (data: {
  email: string;
  name: string;
  password: string;
  profileImage?: string | null;
  provider?: Provider;
}) => {
  return await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      password: data.password,
      profileImage: data.profileImage,
      provider: data.provider || Provider.LOCAL,
    },
  });
};

export const findOrCreateByGoogle = async (data: {
  email: string;
  name: string;
  profileImage?: string | null;
}) => {
  // 기존 유저 확인
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    return existingUser;
  }

  // 새 유저 생성 (구글 유저는 password null)
  return await prisma.user.create({
    data: {
      email: data.email,
      name: data.name,
      profileImage: data.profileImage,
      provider: Provider.GOOGLE,
      password: null,
    },
  });
};
