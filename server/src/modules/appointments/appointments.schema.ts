import { z } from 'zod';
import { AppointmentStatus, AppointmentType } from '@prisma/client';

export const createAppointmentSchema = z.object({
  patientId: z.coerce.number().int().positive('A patient is required'),
  scheduledAt: z.coerce.date(),
  type: z.nativeEnum(AppointmentType).optional(),
  status: z.nativeEnum(AppointmentStatus).optional(),
  note: z.string().max(500).optional(),
});

export type CreateAppointmentDto = z.infer<typeof createAppointmentSchema>;

export const updateAppointmentSchema = z
  .object({
    patientId: z.coerce.number().int().positive().optional(),
    scheduledAt: z.coerce.date().optional(),
    type: z.nativeEnum(AppointmentType).optional(),
    status: z.nativeEnum(AppointmentStatus).optional(),
    note: z.string().max(500).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type UpdateAppointmentDto = z.infer<typeof updateAppointmentSchema>;
