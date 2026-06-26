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
import { Textarea } from '@/components/ui/textarea'
import { createItemSchema, type ItemFormData } from '../schemas/items.schema'
import type { Item } from '../types/items.types'

interface ItemFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  item?: Item | null
  onSubmit: (data: ItemFormData) => void
  isPending: boolean
}

export function ItemFormDialog({ open, onOpenChange, item, onSubmit, isPending }: ItemFormDialogProps) {
  const { t, i18n } = useTranslation('items')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const schema = useMemo(() => createItemSchema(t), [i18n.language])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItemFormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '' },
  })

  useEffect(() => {
    if (open) {
      reset({ title: item?.title ?? '', description: item?.description ?? '' })
    }
  }, [open, item, reset])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{item ? t('form.editTitle') : t('form.createTitle')}</DialogTitle>
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
            <Textarea id="description" rows={4} {...register('description')} />
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
