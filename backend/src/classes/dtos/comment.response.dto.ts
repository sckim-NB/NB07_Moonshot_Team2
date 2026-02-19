export class CommentResponseDto {
  id!: string;
  content!: string;
  auther!: {
    id: string;
    name: string;
    email: string;
    profileImage: string;
  };
  taskId!: string;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<CommentResponseDto>) {
    Object.assign(this, partial);
  }
}

export default { CommentResponseDto };
