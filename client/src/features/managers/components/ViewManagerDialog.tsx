import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import type { Manager } from '../types/managers.types'

interface ViewManagerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  manager: Manager | null
}

function fullName(manager: Manager): string {
  const name = [manager.firstName, manager.lastName].filter(Boolean).join(' ')
  return name || manager.name || '—'
}

export function ViewManagerDialog({ open, onOpenChange, manager }: ViewManagerDialogProps) {
  const { t } = useTranslation('managers')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('view.title')}</DialogTitle>
          <DialogDescription>{t('view.description')}</DialogDescription>
        </DialogHeader>

        {manager && (
          <dl className="flex flex-col">
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm font-medium text-muted-foreground">{t('table.name')}</dt>
              <dd className="text-sm font-medium">{fullName(manager)}</dd>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm font-medium text-muted-foreground">{t('table.email')}</dt>
              <dd className="text-sm font-medium">{manager.email}</dd>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm font-medium text-muted-foreground">{t('table.phone')}</dt>
              <dd className="text-sm font-medium">{manager.phone ?? '—'}</dd>
            </div>
          </dl>
        )}
      </DialogContent>
    </Dialog>
  )
}
