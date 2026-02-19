import { InvalidRequestError, NotFoundError, NotProjectMemberError } from '../lib/errors.js';
import { subtaskRepository } from '../repositories/subtask.repository.js';
import {
  toDbSubtaskStatus,
  toSubtaskResponseDto,
  type SubtaskResponseDto,
  type SubtaskStatusDto,
} from '../dtos/subtask.dto.js';

export const subtaskService = {
  // 하위 할 일 생성
  async createSubtask(input: {
    taskId: string;
    requesterId: string;
    title: string;
  }): Promise<SubtaskResponseDto> {
    const { taskId, requesterId, title } = input;

    // 할 일 조회
    const task = await subtaskRepository.findTaskProjectId(taskId);
    if (!task) throw new NotFoundError('요청을 확인할 수 없습니다');

    // 권한 확인 (멤버)
    const isMember = await subtaskRepository.isAcceptedProjectMember(task.projectId, requesterId);
    if (!isMember) throw new NotProjectMemberError();

    // 생성된 subtask 맨 아래로
    const maxOrder = await subtaskRepository.findMaxSubtaskOrder(taskId);
    const order = maxOrder === null ? 0 : maxOrder + 1;

    // subtask 생성
    const created = await subtaskRepository.createSubtask({ taskId, title, order });

    // 응답 DTO 변환
    return toSubtaskResponseDto(created);
  },

  // 하위 할 일 목록 조회
  async getSubtasks(input: { taskId: string; requesterId: string }): Promise<SubtaskResponseDto[]> {
    const { taskId, requesterId } = input;

    // task 조회
    const task = await subtaskRepository.findTaskProjectId(taskId);
    if (!task) throw new NotFoundError('요청을 확인할 수 없습니다');

    // 권한 확인 (멤버)
    const isMember = await subtaskRepository.isAcceptedProjectMember(task.projectId, requesterId);
    if (!isMember) throw new NotProjectMemberError();

    // 목록 조회
    const rows = await subtaskRepository.findSubtasks(taskId);

    return rows.map(toSubtaskResponseDto);
  },

  // subtask 조회
  async getSubtask(input: { subtaskId: string; requesterId: string }): Promise<SubtaskResponseDto> {
    const { subtaskId, requesterId } = input;

    // subtask 조회
    const subtask = await subtaskRepository.findSubtaskById(subtaskId);
    if (!subtask) throw new NotFoundError('요청을 확인할 수 없습니다');

    // subtask가 속한 task 조회
    const task = await subtaskRepository.findTaskProjectId(subtask.taskId);
    if (!task) throw new NotFoundError('요청을 확인할 수 없습니다');

    // 권한 확인 (멤버)
    const isMember = await subtaskRepository.isAcceptedProjectMember(task.projectId, requesterId);
    if (!isMember) throw new NotProjectMemberError();

    // 응답 DTO 변환
    return toSubtaskResponseDto(subtask);
  },

  // subtask 수정
  async updateSubtask(input: {
    subtaskId: string;
    requesterId: string;
    title?: string;
    status?: SubtaskStatusDto;
  }): Promise<SubtaskResponseDto> {
    const { subtaskId, requesterId, title, status } = input;

    if (title === undefined && status === undefined) throw new InvalidRequestError();

    // subtask 존재 확인
    const subtask = await subtaskRepository.findSubtaskById(subtaskId);
    if (!subtask) throw new NotFoundError('요청을 확인할 수 없습니다');

    // task 조회
    const task = await subtaskRepository.findTaskProjectId(subtask.taskId);
    if (!task) throw new NotFoundError('요청을 확인할 수 없습니다');

    const isMember = await subtaskRepository.isAcceptedProjectMember(task.projectId, requesterId);
    if (!isMember) throw new NotProjectMemberError();

    // 업데이트 데이터 구성
    const data: { title?: string; status?: 'TODO' | 'IN_PROGRESS' | 'DONE' } = {};

    if (title !== undefined) data.title = title;
    if (status !== undefined) data.status = toDbSubtaskStatus(status);

    const updated = await subtaskRepository.updateSubtask(subtaskId, data);

    return toSubtaskResponseDto(updated);
  },

  // subtask 삭제
  async deleteSubtask(input: { subtaskId: string; requesterId: string }): Promise<void> {
    const { subtaskId, requesterId } = input;

    const subtask = await subtaskRepository.findSubtaskById(subtaskId);
    if (!subtask) throw new NotFoundError('요청을 확인할 수 없습니다');

    const task = await subtaskRepository.findTaskProjectId(subtask.taskId);
    if (!task) throw new NotFoundError('요청을 확인할 수 없습니다');

    const isMember = await subtaskRepository.isAcceptedProjectMember(task.projectId, requesterId);
    if (!isMember) throw new NotProjectMemberError();

    await subtaskRepository.deleteSubtask(subtaskId);
  },
};
