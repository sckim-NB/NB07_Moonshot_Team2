import { z } from 'zod';

export const createdProjectSchema = z.object({
  name: z
    .string()
    .min(2, { message: '프로젝트 제목은 최소 2자 부터 압력 가능합니다.' })
    .max(10, { message: '프로젝트 제목은 최대 10자까지 입력 가능합니다' }),
  description: z
    .string()
    .min(5, { message: '프로젝트 내용은 최소 5자 부터 압력 가능합니다.' })
    .max(40, { message: '프로젝트 내용은 최대 40자까지 입력 가능합니다' })
    .optional(),
});

export type CreatedProjectInput = z.infer<typeof createdProjectSchema>;
