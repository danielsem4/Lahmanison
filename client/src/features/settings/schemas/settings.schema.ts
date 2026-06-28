import { z } from 'zod'
import type { TFunction } from 'i18next'

export function createChangePasswordSchema(t: TFunction) {
  return z
    .object({
      currentPassword: z.string().min(1, t('settings:security.currentRequired')),
      newPassword: z.string().min(8, t('settings:security.newMinLength')),
      confirmPassword: z.string().min(1, t('settings:security.confirmRequired')),
    })
    .refine((d) => d.newPassword === d.confirmPassword, {
      message: t('settings:security.mismatch'),
      path: ['confirmPassword'],
    })
}

export type ChangePasswordFormData = z.infer<ReturnType<typeof createChangePasswordSchema>>
