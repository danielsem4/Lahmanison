import { z } from 'zod';

export const createItemSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(2000).optional(),
});

export type CreateItemDto = z.infer<typeof createItemSchema>;

export const updateItemSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    description: z.string().max(2000).nullable().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type UpdateItemDto = z.infer<typeof updateItemSchema>;
