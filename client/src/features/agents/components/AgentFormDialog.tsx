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
import { createAgentSchema, type AgentFormData } from '../schemas/agents.schema'
import type { Agent } from '../types/agents.types'

interface AgentFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  agent?: Agent | null
  onSubmit: (data: AgentFormData) => void
  isPending: boolean
}

const emptyValues: AgentFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
}

export function AgentFormDialog({
  open,
  onOpenChange,
  agent,
  onSubmit,
  isPending,
}: AgentFormDialogProps) {
  const { t, i18n } = useTranslation('agents')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const schema = useMemo(() => createAgentSchema(t), [i18n.language])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AgentFormData>({
    resolver: zodResolver(schema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (open) {
      reset(
        agent
          ? {
              firstName: agent.firstName ?? '',
              lastName: agent.lastName ?? '',
              email: agent.email ?? '',
              phone: agent.phone ?? '',
            }
          : emptyValues,
      )
    }
  }, [open, agent, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{agent ? t('form.editTitle') : t('form.createTitle')}</DialogTitle>
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

          {!agent && <p className="text-xs text-muted-foreground">{t('form.passwordNote')}</p>}

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
