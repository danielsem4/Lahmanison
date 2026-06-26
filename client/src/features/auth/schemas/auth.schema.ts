import { z } from 'zod'
import type { TFunction } from 'i18next'

export function createLoginSchema(t: TFunction) {
  return z.object({
    email: z.string().email(t('auth:validation.emailInvalid')),
    password: z.string().min(1, t('auth:validation.passwordRequired')),
  })
}

export type LoginFormData = z.infer<ReturnType<typeof createLoginSchema>>
