export type projectResponseDtoType = {
  id: string;
  name: string;
  description?: string | null;
  memberCount: number;
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
};

export class projectResponseDto {
  id: string;
  name: string;
  description?: string | null;
  memberCount: number;
  todoCount: number;
  inProgressCount: number;
  doneCount: number;
  constructor(project: projectResponseDtoType) {
    this.id = project.id;
    this.name = project.name;
    this.description = project.description;
    this.memberCount = project.memberCount;
    this.todoCount = project.todoCount;
    this.inProgressCount = project.inProgressCount;
    this.doneCount = project.doneCount;
  }
  static fromArray(projects: projectResponseDtoType[]): projectResponseDto[] {
    return projects.map((project) => new projectResponseDto(project));
  }
}
export default projectResponseDto;
