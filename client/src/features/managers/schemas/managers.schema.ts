import { z } from 'zod'
import type { TFunction } from 'i18next'

export function createManagerSchema(t: TFunction) {
  return z.object({
    firstName: z.string().min(1, t('managers:validation.firstNameRequired')).max(100),
    lastName: z.string().min(1, t('managers:validation.lastNameRequired')).max(100),
    email: z
      .string()
      .min(1, t('managers:validation.emailRequired'))
      .email(t('managers:validation.emailInvalid'))
      .max(200),
    phone: z.string().min(1, t('managers:validation.phoneRequired')).max(40),
  })
}

export type ManagerFormData = z.infer<ReturnType<typeof createManagerSchema>>
