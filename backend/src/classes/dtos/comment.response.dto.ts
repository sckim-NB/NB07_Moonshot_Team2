export class CommentResponseDto {
  id!: string;
  content!: string;
  taskId!: string;
  author!: {
    id: string;
    name: string;
    email: string;
    profileImage: string;
  };
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<CommentResponseDto>) {
    Object.assign(this, partial);
  }
}

export default { CommentResponseDto };
