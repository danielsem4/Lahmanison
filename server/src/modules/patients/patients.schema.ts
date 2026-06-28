import { z } from 'zod';
import { PatientStatus } from '@prisma/client';

export const createPatientSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  email: z.string().min(1, 'Email is required').email('A valid email is required').max(200),
  phone: z.string().min(1, 'Phone is required').max(40),
  age: z.coerce.number().int().min(0).max(150),
  hasImage: z.boolean().optional(),
  status: z.nativeEnum(PatientStatus),
  statusNote: z.string().max(500).optional(),
});

export type CreatePatientDto = z.infer<typeof createPatientSchema>;

export const updatePatientSchema = z
  .object({
    firstName: z.string().min(1).max(100).optional(),
    lastName: z.string().min(1).max(100).optional(),
    email: z.string().min(1).email('A valid email is required').max(200).optional(),
    phone: z.string().min(1).max(40).optional(),
    age: z.coerce.number().int().min(0).max(150).optional(),
    hasImage: z.boolean().optional(),
    status: z.nativeEnum(PatientStatus).optional(),
    statusNote: z.string().max(500).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type UpdatePatientDto = z.infer<typeof updatePatientSchema>;
