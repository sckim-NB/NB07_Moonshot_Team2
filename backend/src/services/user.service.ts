import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';
import { UserRepository } from '../repositories/user.repository';
import {
  UserNotFoundError,
  InvalidRequestError,
  InvalidDataFormatError,
  InvalidCredentialsError,
} from '../lib/errors';
import { Task, Project, User, TaskTag, Tag, Attachment } from '@prisma/client';

// 수정 필요
type TaskWithDetails = Task & {
  project: Pick<Project, 'id' | 'name'>;
  assignee: Pick<User, 'id' | 'name' | 'email' | 'profileImage'> | null;
  taskTags: (TaskTag & { tag: Tag })[];
  attachments: Attachment[];
};
interface ProjectWithCounts {
  id: string | number;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    members: number;
    tasks: number;
  };
  tasks: { status: string }[];
}

// 유저 업데이트 DTO - 최종 리팩토링 때 따로 파일에 저장
interface UpdateUserDto {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
  profileImage?: string | null;
}

interface GetProjectsQuery {
  page?: string;
  limit?: string;
  order?: 'asc' | 'desc';
  order_by?: 'name' | 'created_at';
}

interface GetTasksQuery {
  page?: string;
  limit?: string;
  order?: 'asc' | 'desc';
}
export class UserService {
  private userRepository = new UserRepository();

  // #21 내 정보 조회
  async getMyInfo(userId: string) {
    const user = await this.userRepository.findById(userId);
    // 400 bad request error { "message": "잘못된 요청입니다"}
    if (!userId) {
      throw new InvalidRequestError();
    }
    // 404 Not Found error { "message": "존재하지 않는 유저입니다."}
    if (!user) {
      throw new UserNotFoundError();
    }
    return user;
  }

  // #22 내 정보 수정
  async updateMyInfo(userId: string, body: UpdateUserDto) {
    const { name, currentPassword, newPassword, profileImage } = body;

    // 유저 존재 검증
    const user = await this.userRepository.findRawById(userId);
    if (!user) throw new UserNotFoundError();

    const updateData: {
      name?: string;
      password?: string;
      profileImage?: string | null;
    } = {};

    if (name) updateData.name = name;
    if (profileImage !== undefined) updateData.profileImage = profileImage;

    // 비밀번호 변경 - 검증 ( 400, 401 error - 401 error는 미들웨어에서)
    if (currentPassword || newPassword) {
      if (!currentPassword || !newPassword) {
        throw new InvalidDataFormatError();
      }

      // 현재 비밀번호 일치 여부 (소셜 로그인 유저는 password가 null일 수)
      if (!user.password) throw new InvalidRequestError();

      const isMatchPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isMatchPassword) {
        throw new InvalidCredentialsError(); // 비밀번호 불일치 시 400
      }

      updateData.password = await bcrypt.hash(newPassword, 10);
    }
    return await this.userRepository.update(userId, updateData);
  }

  // #23 참여 중인 프로젝트 조회
  async getUserProjects(userId: string, query: GetProjectsQuery) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const order = query.order === 'asc' || query.order === 'desc' ? query.order : 'desc';

    if (page < 1 || limit < 1 || limit > 100) {
      throw new InvalidRequestError();
    }

    let orderByField: keyof Prisma.ProjectOrderByWithRelationInput;
    switch (query.order_by) {
      case 'name':
        orderByField = 'name';
        break;
      case 'created_at':
        orderByField = 'createdAt';
        break;
      default:
        orderByField = 'createdAt';
    }

    const { projects, total } = await this.userRepository.findUserProjects(userId, {
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { [orderByField]: order },
    });

    // 데이터 가공
    const data = (projects as ProjectWithCounts[]).map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      memberCount: p._count.members,
      todoCount: p.tasks.filter((t) => t.status === 'TODO').length,
      inProgressCount: p.tasks.filter((t) => t.status === 'IN_PROGRESS').length,
      doneCount: p.tasks.filter((t) => t.status === 'DONE').length,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return { data, total };
  }
  // #24 참여 중인 모든 프로젝트의 할 일 목록 조회
  async getMyTasks(userId: string, query: GetTasksQuery) {
    // 쿼리 스트링에서 페이지네이션 및 정렬 값 추출
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const order = query.order === 'asc' ? 'asc' : 'desc';

    // Task -> Project -> ProjectMember -> User
    const [tasks, totalCount] = (await this.userRepository.findUserTasks(userId, {
      skip: (page - 1) * limit,
      take: limit,
      order: order,
    })) as [TaskWithDetails[], number];
    const data = tasks.map((task: TaskWithDetails) => {
      return {
        id: task.id,
        projectId: task.projectId,
        title: task.title,
        startYear: task.startYear,
        startMonth: task.startMonth,
        startDay: task.startDay,
        endYear: task.endYear,
        endMonth: task.endMonth,
        endDay: task.endDay,
        status: task.status.toLowerCase(),
        assignee: task.assignee
          ? {
              id: task.assignee.id,
              name: task.assignee.name,
              email: task.assignee.email,
              profileImage: task.assignee.profileImage,
            }
          : null,
        tags: task.taskTags.map((tt) => ({
          id: tt.tag.id,
          name: tt.tag.name,
        })),
        attachments: task.attachments.map((a) => a.filepath),
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      };
    });
    return {
      data,
      total: totalCount,
    };
  }
}
