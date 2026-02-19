export class CommentRequestDto {
  content!: string;
  userId!: string;
  taskId!: string;
  constructor(data: { content: string; userId: string; taskId: string }) {
    this.content = data.content;
    this.userId = data.userId;
    this.taskId = data.taskId;
  }
}

export class CommentUpdateRequestDto {
  content?: string | undefined;
  constructor(data: { content?: string | undefined }) {
    this.content = data.content;
  }
}
export default { CommentRequestDto, CommentUpdateRequestDto };
