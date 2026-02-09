import { Provider } from '@prisma/client';
import { prisma } from '../lib/db.js';
// #21 유저 - 내 정보 조회
// #22 유저 - 내 정보 수정

export class UserRepository {
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
     // 수정 - 유저 전체 정보 가져오기
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
