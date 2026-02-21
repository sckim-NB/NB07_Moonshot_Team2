import * as commentRepository from '../repositories/comment.repository';
import {
  CreatedCommentInput,
  ListCommentsInput,
  UpdateCommentInput,
} from '../schemas/comment.schema';
import { CommentResponseDto } from '../classes/dtos/comment.response.dto';
import { CommentRequestDto, CommentUpdateRequestDto } from '../classes/dtos/comment.request.dto';
import { NotFoundError, NotCommentOwnerError } from '../lib/errors';

export async function createComment(data: CreatedCommentInput) {
  const dto = new CommentRequestDto(data);

  const createdComment = await commentRepository.createComment({
    content: dto.content,
    userId: dto.userId,
    taskId: dto.taskId,
  });

  return new CommentResponseDto({
    id: createdComment.id,
    content: createdComment.content,
    author: {
      id: createdComment.userId,
      name: '',
      email: '',
      profileImage: '',
    },
    taskId: createdComment.taskId,
    createdAt: createdComment.createdAt,
    updatedAt: createdComment.updatedAt,
  });
}

export async function listComments(params: ListCommentsInput) {
  const { comments } = await commentRepository.listComments({
    page: params.page ?? 1,
    pageSize: params.pageSize ?? 10,
    taskId: params.taskId,
  });

  const commentDtos = comments.map(
    (comment) =>
      new CommentResponseDto({
        id: comment.id,
        content: comment.content,
        author: {
          id: comment.userId,
          name: comment.user.name,
          email: comment.user.email,
          profileImage: '',
        },
        taskId: comment.taskId,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      })
  );

  const total = await commentRepository.totalCommentsCount(params.taskId);

  return { data: commentDtos, total: total };
}

export async function getComment(commentId: string) {
  const comment = await commentRepository.getComment(commentId);

  if (!comment) {
    throw new NotFoundError();
  }

  return new CommentResponseDto({
    id: comment.id,
    content: comment.content,
    author: {
      id: comment.userId,
      name: '',
      email: '',
      profileImage: '',
    },
    taskId: comment.taskId,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  });
}

export async function updateComment(commentId: string, data: UpdateCommentInput) {
  const dto = new CommentUpdateRequestDto(data);

  const extingingComment = await commentRepository.getComment(commentId);
  if (!extingingComment) {
    throw new NotFoundError();
  }
  const requesterId = '';
  if (extingingComment.userId !== requesterId) {
    throw new NotCommentOwnerError('update');
  }
  const updateComment = await commentRepository.updateComment(commentId, {
    content: dto.content,
  });

  return new CommentResponseDto({
    id: updateComment.id,
    content: updateComment.content,

    author: {
      id: updateComment.userId,
      name: '',
      email: '',
      profileImage: '',
    },
    taskId: updateComment.taskId,
    createdAt: updateComment.createdAt,
    updatedAt: updateComment.updatedAt,
  });
}

export async function deleteComment(commentId: string) {
  const extingingComment = await commentRepository.getComment(commentId);
  if (!extingingComment) {
    throw new NotFoundError();
  }
  const requesterId = '';
  if (extingingComment.userId === requesterId) {
    throw new NotCommentOwnerError('delete');
  }

  return await commentRepository.deleteComment(commentId);
}
