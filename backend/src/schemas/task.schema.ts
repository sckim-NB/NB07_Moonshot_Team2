// import z from 'zod';

// export const createdTaskSchema = z.object({
//   projectId: z.string().uuid({ message: '유효한 프로젝트 ID여야 합니다.' }),
//   title: z
//     .string()
//     .min(2, { message: '작업 제목은 최소 2자 부터 입력 가능합니다.' })
//     .max(10, { message: '작업 제목은 최대 10자까지 입력 가능합니다.' }),
//   startYear: z.number().int().min(2000).max(2100),
//   startMonth: z.number().int().min(1).max(12),
//   startDay: z.number().int().min(1).max(31),
//   endYear: z.number().int().min(2000).max(2100),
//   endMonth: z.number().int().min(1).max(12),
//   endDay: z.number().int().min(1).max(31),
//   status: z.enum(['todo', 'in_progress', 'done']),
//   assignee: z.string().uuid().nullable(),
//   tags: z.array(z.string().uuid()),
//   attachments: z.array(z.string().url()),
// });

// export type CreatedTaskInput = z.infer<typeof createdTaskSchema>;
// export const updateTaskSchema = z.object({
//   title: z
//     .string()
//     .min(2, { message: '작업 제목은 최소 2자 부터 입력 가능합니다.' })
//     .max(10, { message: '작업 제목은 최대 10자까지 입력 가능합니다.' })
//     .optional(),
//   startYear: z.number().int().min(2000).max(2100).optional(),
//   startMonth: z.number().int().min(1).max(12).optional(),
//   startDay: z.number().int().min(1).max(31).optional(),
//   endYear: z.number().int().min(2000).max(2100).optional(),
//   endMonth: z.number().int().min(1).max(12).optional(),
//   endDay: z.number().int().min(1).max(31).optional(),
//   status: z.enum(['todo', 'in_progress', 'done']).optional(),
//   assignee: z.string().uuid().nullable().optional(),
//   tags: z.array(z.string().uuid()).optional(),
//   attachments: z.array(z.string().url()).optional(),
// });

// export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
// export const listTaskSchema = z.object({
//   projectId: z.string().uuid({ message: '유효한 프로젝트 ID여야 합니다.' }),
//   status: z.enum(['todo', 'in_progress', 'done']).optional(),
//   assignee: z.string().uuid().optional(),
//   tags: z.array(z.string().uuid()).optional(),
//   page: z.number().int().min(1).optional(),
//   limit: z.number().int().min(1).max(100).optional(),
// });

// export type ListTaskInput = z.infer<typeof listTaskSchema>;
import z from 'zod';

export const createdTaskSchema = z.object({
  projectId: z.string({ message: '유효한 프로젝트 ID여야 합니다.' }),
  title: z
    .string()
    .min(2, { message: '작업 제목은 최소 2자 부터 입력 가능합니다.' })
    .max(10, { message: '작업 제목은 최대 10자까지 입력 가능합니다.' }),
  startYear: z.number().int().min(2000).max(2100),
  startMonth: z.number().int().min(1).max(12),
  startDay: z.number().int().min(1).max(31),
  endYear: z.number().int().min(2000).max(2100),
  endMonth: z.number().int().min(1).max(12),
  endDay: z.number().int().min(1).max(31),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  assignee: z.string().nullable().optional().default(null),
  tags: z.array(z.string()).default([]),
  attachments: z.array(z.string().url()).default([]),
});

export type CreatedTaskInput = z.infer<typeof createdTaskSchema>;
export const updateTaskSchema = z.object({
  title: z
    .string()
    .min(2, { message: '작업 제목은 최소 2자 부터 입력 가능합니다.' })
    .max(10, { message: '작업 제목은 최대 10자까지 입력 가능합니다.' })
    .optional(),
  startYear: z.number().int().min(2000).max(2100).optional(),
  startMonth: z.number().int().min(1).max(12).optional(),
  startDay: z.number().int().min(1).max(31).optional(),
  endYear: z.number().int().min(2000).max(2100).optional(),
  endMonth: z.number().int().min(1).max(12).optional(),
  endDay: z.number().int().min(1).max(31).optional(),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  assignee: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  attachments: z.array(z.string().url()).default([]),
});

export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export const listTaskSchema = z.object({
  projectId: z.string({ message: '유효한 프로젝트 ID여야 합니다.' }),
  status: z.enum(['todo', 'in_progress', 'done']).optional(),
  assignee: z.string().optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export type ListTaskInput = z.infer<typeof listTaskSchema>;
