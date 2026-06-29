import { useEffect, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { usePatients } from '@/features/patients'
import { createAppointmentSchema, type AppointmentFormData } from '../schemas/appointments.schema'
import type { Appointment, AppointmentStatus, AppointmentType } from '../types/appointments.types'

interface AppointmentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment?: Appointment | null
  onSubmit: (data: AppointmentFormData) => void
  isPending: boolean
  // When set, new appointments default to this patient and the picker is locked
  // (used when scheduling from a specific patient's detail page).
  lockedPatientId?: number
}

const STATUSES: AppointmentStatus[] = ['SCHEDULED', 'COMPLETED', 'CANCELLED']
const TYPES: AppointmentType[] = ['MEETING', 'PHONE_CALL']

// Convert an ISO timestamp to the value a <input type="datetime-local"> expects.
function toLocalInput(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

const emptyValues: AppointmentFormData = {
  patientId: 0,
  scheduledAt: '',
  type: 'MEETING',
  status: 'SCHEDULED',
  note: '',
}

export function AppointmentFormDialog({
  open,
  onOpenChange,
  appointment,
  onSubmit,
  isPending,
  lockedPatientId,
}: AppointmentFormDialogProps) {
  const { t, i18n } = useTranslation('appointments')
  const { data: patients } = usePatients()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const schema = useMemo(() => createAppointmentSchema(t), [i18n.language])

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (open) {
      reset(
        appointment
          ? {
              patientId: appointment.patientId,
              scheduledAt: toLocalInput(appointment.scheduledAt),
              type: appointment.type,
              status: appointment.status,
              note: appointment.note ?? '',
            }
          : { ...emptyValues, patientId: lockedPatientId ?? emptyValues.patientId },
      )
    }
  }, [open, appointment, lockedPatientId, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {appointment ? t('form.editTitle') : t('form.createTitle')}
          </DialogTitle>
          <DialogDescription>{t('form.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="patientId">{t('form.patientLabel')}</Label>
            <Controller
              control={control}
              name="patientId"
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : ''}
                  onValueChange={(value) => field.onChange(Number(value))}
                  disabled={lockedPatientId !== undefined}
                >
                  <SelectTrigger id="patientId" className="w-full" aria-invalid={!!errors.patientId}>
                    <SelectValue placeholder={t('form.patientPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {(patients ?? []).map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.patientId && (
              <p className="text-xs text-destructive">{errors.patientId.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="scheduledAt">{t('form.scheduledAtLabel')}</Label>
            <Input
              id="scheduledAt"
              type="datetime-local"
              aria-invalid={!!errors.scheduledAt}
              {...register('scheduledAt')}
            />
            {errors.scheduledAt && (
              <p className="text-xs text-destructive">{errors.scheduledAt.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="type">{t('form.typeLabel')}</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="type" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPES.map((ty) => (
                      <SelectItem key={ty} value={ty}>
                        {t(`type.${ty}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="status">{t('form.statusLabel')}</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {t(`status.${s}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="note">{t('form.noteLabel')}</Label>
            <Textarea id="note" rows={2} {...register('note')} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('form.cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {t('form.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
