import { Provider, Prisma } from '@prisma/client';
import { prisma } from '../lib/db.js';

export class UserRepository {
  // #21 유저 - 내 정보 조회
  async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  // #22 유저 - 내 정보 수정
  async findRawById(id: string) {
    return await prisma.user.findUnique({ where: { id } });
  }
  async update(
    id: string,
    data: { name?: string; password?: string; profileImage?: string | null }
  ) {
    return await prisma.user.update({
      where: { id },
      data,
      select: {
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
  async findUserProjects(
    userId: string,
    params: {
      skip: number;
      take: number;
      orderBy: Prisma.ProjectOrderByWithRelationInput;
    }
  ) {
    const [projects, total] = await prisma.$transaction([
      prisma.project.findMany({
        where: {
          members: { some: { userId } }, //
        },
        skip: params.skip,
        take: params.take,
        orderBy: params.orderBy,
        include: {
          _count: {
            select: {
              members: true,
              tasks: true,
            },
          },

          tasks: {
            select: { status: true },
          },
        },
      }),
      prisma.project.count({
        where: { members: { some: { userId } } },
      }),
    ]);

    return { projects, total };
  }

  // #24 유저 - 참여 중인 모든 프로젝트의 할 일 목록 조회
  async findUserTasks(
    userId: string,
    params: {
      skip: number;
      take: number;
      order: 'asc' | 'desc';
    }
  ) {
    const { skip, take, order } = params;

    return await prisma.$transaction([
      prisma.task.findMany({
        where: {
          project: {
            members: {
              some: { userId: userId },
            },
          },
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
            },
          },
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
          taskTags: {
            include: {
              tag: true,
            },
          },
          attachments: true,
        },
        skip,
        take,
        orderBy: {
          createdAt: order,
        },
      }),
      prisma.task.count({
        where: {
          project: {
            members: {
              some: { userId: userId },
            },
          },
        },
      }),
    ]);
  }
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
