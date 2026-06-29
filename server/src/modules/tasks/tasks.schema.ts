import { z } from 'zod';
import { TaskStatus } from '@prisma/client';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  dueDate: z.coerce.date().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  patientId: z.coerce.number().int().positive().optional().nullable(),
});

export type CreateTaskDto = z.infer<typeof createTaskSchema>;

export const updateTaskSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(1000).optional(),
    dueDate: z.coerce.date().optional().nullable(),
    status: z.nativeEnum(TaskStatus).optional(),
    patientId: z.coerce.number().int().positive().optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type UpdateTaskDto = z.infer<typeof updateTaskSchema>;
