export class CommentRequestDto {
  content!: string;
  userId!: string;
  taskId!: string;
}

export class CommentUpdateRequestDto {
  content: string | undefined;
}
export default { CommentRequestDto, CommentUpdateRequestDto };
