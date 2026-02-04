import { Provider } from '@prisma/client';
import { prisma } from '../lib/db.js';
// #21 유저 내 정보 조회
// model User {
//   id            String          @id @default(cuid())
//   email         String          @unique
//   name          String
//   password      String?
//   profileImage  String?
//   provider      Provider        @default(LOCAL)
//   createdAt     DateTime        @default(now())
//   updatedAt     DateTime        @updatedAt
//   ownedProjects Project[]       @relation("ProjectOwner")
//   memberships   ProjectMember[]
//   tasks         Task[]          @relation("TaskAssignee")
//   comments      Comment[]
//   invitations   Invitation[]

//   @@map("users")
// }

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
