import { z } from 'zod'
import type { TFunction } from 'i18next'

export function createTaskSchema(t: TFunction) {
  return z.object({
    title: z.string().min(1, t('tasks:validation.titleRequired')).max(200),
    description: z.string().max(1000).optional(),
    dueDate: z.string().optional(),
    status: z.enum(['OPEN', 'DONE']),
    patientId: z.coerce.number().int().positive().nullable().optional(),
  })
}

export type TaskFormData = z.infer<ReturnType<typeof createTaskSchema>>
