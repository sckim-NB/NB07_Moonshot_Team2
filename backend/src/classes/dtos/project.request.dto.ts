export class projectRequestDto {
  name: string;
  description?: string | null;
  ownerId: string;

  constructor(data: { name: string; description?: string | null; ownerId: string }) {
    this.name = data.name;
    this.description = data.description;
    this.ownerId = data.ownerId;
  }
}

export class projectUpdateDto {
  name?: string | undefined;
  description?: string | null;
  constructor(data: { name?: string | undefined; description?: string | null }) {
    this.name = data.name;
    this.description = data.description;
  }
}
export default { projectRequestDto, projectUpdateDto };
