import { Request, Response } from 'express';
import { createdCommentSchema, updateCommentSchema } from '../schemas/comment.schema';
import * as commentService from '../services/comment.service';

export async function createComment(req: Request, res: Response) {
  // Implementation for creating a comment
  const validatedData = createdCommentSchema.parse(req.body);
  const newComment = await commentService.createComment(validatedData);
  res.status(201).json(newComment);
}

export async function listComments(req: Request, res: Response) {
  const taskId = req.query.taskId as string;
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const pageSize = req.query.pageSize ? parseInt(req.query.pageSize as string, 10) : 10;

  const { data: comments, total } = await commentService.listComments({
    taskId,
    page,
    pageSize,
  });
  res.status(200).json({ data: comments, total });
}

export async function getComment(req: Request, res: Response) {
  const commentId = req.params.commentId as string;
  const comment = await commentService.getComment(commentId);
  res.status(200).json(comment);
}

export async function updateComment(req: Request, res: Response) {
  const commentId = req.params.commentId as string;
  const validatedData = updateCommentSchema.parse(req.body);
  const updatedComment = await commentService.updateComment(commentId, validatedData);
  res.status(200).json(updatedComment);
}

export async function deleteComment(req: Request, res: Response) {
  const commentId = req.params.commentId as string;
  await commentService.deleteComment(commentId);
  res.status(204).send();
}
