import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import type { AppointmentStatus } from '../types/appointments.types'

const VARIANT: Record<AppointmentStatus, 'secondary' | 'default' | 'outline'> = {
  SCHEDULED: 'default',
  COMPLETED: 'secondary',
  CANCELLED: 'outline',
}

export function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const { t } = useTranslation('appointments')
  return <Badge variant={VARIANT[status]}>{t(`status.${status}`)}</Badge>
}
