import { useEffect, useMemo } from 'react'
import { useForm, Controller, type Resolver } from 'react-hook-form'
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
import { createTaskSchema, type TaskFormData } from '../schemas/tasks.schema'
import type { Task } from '../types/tasks.types'

interface TaskFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task | null
  onSubmit: (data: TaskFormData) => void
  isPending: boolean
}

const NONE = 'none'

const emptyValues: TaskFormData = {
  title: '',
  description: '',
  dueDate: '',
  status: 'OPEN',
  patientId: null,
}

export function TaskFormDialog({
  open,
  onOpenChange,
  task,
  onSubmit,
  isPending,
}: TaskFormDialogProps) {
  const { t, i18n } = useTranslation('tasks')
  const { data: patients } = usePatients()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const schema = useMemo(() => createTaskSchema(t), [i18n.language])

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<TaskFormData>({
    // schema input type differs from output (z.coerce.number) — cast to the
    // form's value type, which is what the rest of the component works with.
    resolver: zodResolver(schema) as Resolver<TaskFormData>,
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (open) {
      reset(
        task
          ? {
              title: task.title,
              description: task.description ?? '',
              dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
              status: task.status,
              patientId: task.patientId,
            }
          : emptyValues,
      )
    }
  }, [open, task, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task ? t('form.editTitle') : t('form.createTitle')}</DialogTitle>
          <DialogDescription>{t('form.description')}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">{t('form.titleLabel')}</Label>
            <Input id="title" aria-invalid={!!errors.title} {...register('title')} />
            {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">{t('form.descriptionLabel')}</Label>
            <Textarea id="description" rows={2} {...register('description')} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="dueDate">{t('form.dueDateLabel')}</Label>
              <Input id="dueDate" type="date" {...register('dueDate')} />
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
                      <SelectItem value="OPEN">{t('status.OPEN')}</SelectItem>
                      <SelectItem value="DONE">{t('status.DONE')}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="patientId">{t('form.patientLabel')}</Label>
            <Controller
              control={control}
              name="patientId"
              render={({ field }) => (
                <Select
                  value={field.value ? String(field.value) : NONE}
                  onValueChange={(value) => field.onChange(value === NONE ? null : Number(value))}
                >
                  <SelectTrigger id="patientId" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>{t('form.patientNone')}</SelectItem>
                    {(patients ?? []).map((p) => (
                      <SelectItem key={p.id} value={String(p.id)}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
