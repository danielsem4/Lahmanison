import { z } from 'zod'
import type { TFunction } from 'i18next'

export function createItemSchema(t: TFunction) {
  return z.object({
    title: z.string().min(1, t('items:validation.titleRequired')).max(200),
    description: z.string().max(2000).optional(),
  })
}

export type ItemFormData = z.infer<ReturnType<typeof createItemSchema>>
