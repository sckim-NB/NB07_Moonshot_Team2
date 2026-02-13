import {
  InvalidRequestError,
  NotFoundError,
  NotProjectMemberError,
} from '../lib/errors.js';
import { subtaskRepository } from '../repositories/subtask.repository.js';
import { toSubtaskResponseDto, type SubtaskResponseDto } from '../dtos/subtask.dto.js';

export const subtaskService = {

  // 하위 할 일 생성
  async createSubtask(input: {
    taskId: string;
    requesterId: string;
    title: string;
  }): Promise<SubtaskResponseDto> {
    const { taskId, requesterId } = input;

    // title 검증
    if (typeof input.title !== 'string') throw new InvalidRequestError();
    
    const title = input.title.trim();
    if (!title) throw new InvalidRequestError();

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
  async getSubtasks(input: {
    taskId: string;
    requesterId: string;
  }): Promise<SubtaskResponseDto[]> {
    const { taskId, requesterId } = input;

    // task 조회
    const task = await subtaskRepository.findTaskProjectId(taskId);
    if (!task) throw new NotFoundError('요청을 확인할 수 없습니다');

    // 권한 확인 (멤버)
    const isMember = await subtaskRepository.isAcceptedProjectMember(
        task.projectId, 
        requesterId
    );
    if (!isMember) throw new NotProjectMemberError();

    // 목록 조회
    const rows = await subtaskRepository.findSubtasks(taskId);

    return rows.map(toSubtaskResponseDto);
   
  },


  
};
