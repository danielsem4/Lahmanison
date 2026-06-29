import { z } from 'zod'
import type { TFunction } from 'i18next'

export function createAgentSchema(t: TFunction) {
  return z.object({
    firstName: z.string().min(1, t('agents:validation.firstNameRequired')).max(100),
    lastName: z.string().min(1, t('agents:validation.lastNameRequired')).max(100),
    email: z
      .string()
      .min(1, t('agents:validation.emailRequired'))
      .email(t('agents:validation.emailInvalid'))
      .max(200),
    phone: z.string().min(1, t('agents:validation.phoneRequired')).max(40),
  })
}

export type AgentFormData = z.infer<ReturnType<typeof createAgentSchema>>
