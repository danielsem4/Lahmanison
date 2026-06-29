import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import type { PatientStatus } from '../types/patients.types'

const VARIANT: Record<PatientStatus, 'secondary' | 'default' | 'outline'> = {
  PENDING: 'secondary',
  IN_TREATMENT: 'default',
  DISCHARGED: 'outline',
}

export function PatientStatusBadge({ status }: { status: PatientStatus }) {
  const { t } = useTranslation('patients')
  return <Badge variant={VARIANT[status]}>{t(`status.${status}`)}</Badge>
}
