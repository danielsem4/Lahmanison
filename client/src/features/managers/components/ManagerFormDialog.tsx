import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
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
import { createManagerSchema, type ManagerFormData } from '../schemas/managers.schema'
import type { Manager } from '../types/managers.types'

interface ManagerFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  manager?: Manager | null
  onSubmit: (data: ManagerFormData) => void
  isPending: boolean
}

const emptyValues: ManagerFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
}

export function ManagerFormDialog({
  open,
  onOpenChange,
  manager,
  onSubmit,
  isPending,
}: ManagerFormDialogProps) {
  const { t, i18n } = useTranslation('managers')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const schema = useMemo(() => createManagerSchema(t), [i18n.language])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ManagerFormData>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (open) {
      reset(
        manager
          ? {
              firstName: manager.firstName ?? '',
              lastName: manager.lastName ?? '',
              email: manager.email ?? '',
              phone: manager.phone ?? '',
            }
          : emptyValues,
      )
    }
  }, [open, manager, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{manager ? t('form.editTitle') : t('form.createTitle')}</DialogTitle>
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

          <div className="space-y-1.5">
            <Label htmlFor="phone">{t('form.phoneLabel')}</Label>
            <Input id="phone" type="tel" aria-invalid={!!errors.phone} {...register('phone')} />
            {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
          </div>

          {!manager && <p className="text-xs text-muted-foreground">{t('form.passwordNote')}</p>}

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
