import { z } from 'zod'
import type { TFunction } from 'i18next'

export function createPatientSchema(t: TFunction) {
  return z.object({
    firstName: z.string().min(1, t('patients:validation.firstNameRequired')).max(100),
    lastName: z.string().min(1, t('patients:validation.lastNameRequired')).max(100),
    email: z
      .string()
      .min(1, t('patients:validation.emailRequired'))
      .email(t('patients:validation.emailInvalid'))
      .max(200),
    phone: z.string().min(1, t('patients:validation.phoneRequired')).max(40),
    age: z.coerce
      .number({ invalid_type_error: t('patients:validation.ageInvalid') })
      .int(t('patients:validation.ageInvalid'))
      .min(0, t('patients:validation.ageInvalid'))
      .max(150, t('patients:validation.ageInvalid')),
    status: z.enum(['PENDING', 'IN_TREATMENT', 'DISCHARGED']),
    statusNote: z.string().max(500).optional(),
    hasImage: z.boolean().optional(),
  })
}

export type PatientFormData = z.infer<ReturnType<typeof createPatientSchema>>
