import z from 'zod';
export const createdCommentSchema = z.object({
  content: z
    .string()
    .min(1, { message: '댓글 내용은 최소 1자 이상이어야 합니다.' })
    .max(500, { message: '댓글 내용은 최대 500자 이하여야 합니다.' }),
  userId: z.string({ message: '유효한 사용자 ID여야 합니다.' }),
  taskId: z.string({ message: '유효한 작업 ID여야 합니다.' }),
});
export type CreatedCommentInput = z.infer<typeof createdCommentSchema>;
export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, { message: '댓글 내용은 최소 1자 이상이어야 합니다.' })
    .max(500, { message: '댓글 내용은 최대 500자 이하여야 합니다.' })
    .optional(),
});
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export const listCommentSchema = z.object({
  taskId: z.string({ message: '유효한 작업 ID여야 합니다.' }),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
});
export type ListCommentsInput = z.infer<typeof listCommentSchema>;
