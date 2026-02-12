import * as projectRepository from '../repositories/project.repository';
import { InvalidDataFormatError, NotProjectMemberError, NotProjectOwnerError } from '../lib/errors';
import { CreatedProjectInput } from '../schemas/project.schema';
import { projectRequestDto, projectUpdateDto } from '../classes/dtos/project.request.dto';
import { projectResponseDto } from '../classes/dtos/project.response.dto';

export async function createProject(
  data: CreatedProjectInput & { ownerId: string }
) {
  const dto = new projectRequestDto(data);
  const ownerProjectCount = await projectRepository.projectOwnerCount(dto.ownerId);
  if (ownerProjectCount >= 5) {
    throw new Error('Project creation limit reached. You can create up to 5 projects.');
  }

  const createdProject = await projectRepository.createProject({
    name: dto.name,
    description: dto.description,
    ownerId: dto.ownerId,
  });

  return new projectResponseDto({
    id: createdProject.id,
    name: createdProject.name,
    description: createdProject.description,
    memberCount: (await projectRepository.projectMemberCount(createdProject.id)) ?? 0,
    todoCount: (await projectRepository.todoCount(createdProject.id)) ?? 0,
    inProgressCount: (await projectRepository.inProgressCount(createdProject.id)) ?? 0,
    doneCount: (await projectRepository.doneCount(createdProject.id)) ?? 0,
  });
}

export async function getProject(projectId: string) {
  const project = await projectRepository.getProject(projectId);

  if (!project) {
    throw new InvalidDataFormatError();
  }
  if (project.ownerId !== projectId) {
    throw new NotProjectMemberError();
  }

  return new projectResponseDto({
    id: project.id,
    name: project.name,
    description: project.description,
    memberCount: (await projectRepository.projectMemberCount(projectId)) ?? 0,
    todoCount: (await projectRepository.todoCount(projectId)) ?? 0,
    inProgressCount: (await projectRepository.inProgressCount(projectId)) ?? 0,
    doneCount: (await projectRepository.doneCount(projectId)) ?? 0,
  });
}

export async function updateProject(
  projectId: string,
  data: CreatedProjectInput
) {
  const extingProject = await projectRepository.getProject(projectId);
  
  if (!extingProject) {
    throw new InvalidDataFormatError();
  }

  if (extingProject.ownerId !== projectId) {
    throw new NotProjectOwnerError();
  }

  const dto = new projectUpdateDto(data);

  const updatedProject = await projectRepository.updateProject(projectId, dto);

  return new projectResponseDto({
    id: updatedProject.id,
    name: updatedProject.name,
    description: updatedProject.description,
    memberCount: (await projectRepository.projectMemberCount(projectId)) ?? 0,
    todoCount: (await projectRepository.todoCount(projectId)) ?? 0,
    inProgressCount: (await projectRepository.inProgressCount(projectId)) ?? 0,
    doneCount: (await projectRepository.doneCount(projectId)) ?? 0,
  });
}

export async function deleteProject(projectId: string) {
  const exctingProject = await projectRepository.getProject(projectId);

  if (!exctingProject) {
    throw new InvalidDataFormatError();
  }

  if (exctingProject.ownerId !== projectId) {
    throw new NotProjectOwnerError();
  }

  return await projectRepository.deleteProject(projectId);
}
