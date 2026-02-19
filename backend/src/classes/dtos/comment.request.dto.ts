export class CommentRequestDto {
  content!: string;
  userId!: string;
  taskId!: string;
  constructor(partial: Partial<CommentRequestDto>) {
    Object.assign(this, partial);
  }
}

export class CommentUpdateRequestDto {
  content: string | undefined;
  constructor(partial: Partial<CommentUpdateRequestDto>) {
    Object.assign(this, partial);
  }
}
export default { CommentRequestDto, CommentUpdateRequestDto };
