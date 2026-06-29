import { z } from 'zod'
import type { TFunction } from 'i18next'

export function createAppointmentSchema(t: TFunction) {
  return z.object({
    patientId: z.coerce
      .number({ error: t('appointments:validation.patientRequired') })
      .int()
      .positive(t('appointments:validation.patientRequired')),
    scheduledAt: z.string().min(1, t('appointments:validation.scheduledAtRequired')),
    type: z.enum(['MEETING', 'PHONE_CALL']),
    status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED']),
    note: z.string().max(500).optional(),
  })
}

export type AppointmentFormData = z.infer<ReturnType<typeof createAppointmentSchema>>
