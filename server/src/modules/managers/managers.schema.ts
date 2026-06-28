import { z } from 'zod';

export const createManagerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().min(1, 'Email is required').email('A valid email is required').max(200),
  phone: z.string().min(1, 'Phone is required').max(40),
});

export type CreateManagerDto = z.infer<typeof createManagerSchema>;

export const updateManagerSchema = z
  .object({
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    email: z.string().min(1).email('A valid email is required').max(200).optional(),
    phone: z.string().min(1).max(40).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type UpdateManagerDto = z.infer<typeof updateManagerSchema>;
