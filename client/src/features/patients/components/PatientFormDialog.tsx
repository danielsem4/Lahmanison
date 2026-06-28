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
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createPatientSchema, type PatientFormData } from '../schemas/patients.schema'
import type { Patient, PatientStatus } from '../types/patients.types'

interface PatientFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient?: Patient | null
  onSubmit: (data: PatientFormData) => void
  isPending: boolean
}

const STATUSES: PatientStatus[] = ['PENDING', 'IN_TREATMENT', 'DISCHARGED']

const emptyValues: PatientFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  age: 0,
  status: 'PENDING',
  statusNote: '',
  hasImage: false,
}

export function PatientFormDialog({
  open,
  onOpenChange,
  patient,
  onSubmit,
  isPending,
}: PatientFormDialogProps) {
  const { t, i18n } = useTranslation('patients')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const schema = useMemo(() => createPatientSchema(t), [i18n.language])

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (open) {
      reset(
        patient
          ? {
              firstName: patient.firstName ?? '',
              lastName: patient.lastName ?? '',
              email: patient.email ?? '',
              phone: patient.phone ?? '',
              age: patient.age ?? 0,
              status: patient.status ?? 'PENDING',
              statusNote: patient.statusNote ?? '',
              hasImage: patient.hasImage ?? false,
            }
          : emptyValues,
      )
    }
  }, [open, patient, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{patient ? t('form.editTitle') : t('form.createTitle')}</DialogTitle>
          <DialogDescription>{t('form.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">{t('form.firstNameLabel')}</Label>
              <Input id="firstName" aria-invalid={!!errors.firstName} {...register('firstName')} />
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lastName">{t('form.lastNameLabel')}</Label>
              <Input id="lastName" aria-invalid={!!errors.lastName} {...register('lastName')} />
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">{t('form.emailLabel')}</Label>
            <Input id="email" type="email" aria-invalid={!!errors.email} {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="phone">{t('form.phoneLabel')}</Label>
              <Input id="phone" type="tel" aria-invalid={!!errors.phone} {...register('phone')} />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="age">{t('form.ageLabel')}</Label>
              <Input
                id="age"
                type="number"
                min={0}
                max={150}
                aria-invalid={!!errors.age}
                {...register('age')}
              />
              {errors.age && <p className="text-xs text-destructive">{errors.age.message}</p>}
            </div>
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
            <Label htmlFor="statusNote">{t('form.statusNoteLabel')}</Label>
            <Textarea id="statusNote" rows={2} {...register('statusNote')} />
          </div>

          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="hasImage">{t('form.hasImageLabel')}</Label>
            <Controller
              control={control}
              name="hasImage"
              render={({ field }) => (
                <Switch id="hasImage" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
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
