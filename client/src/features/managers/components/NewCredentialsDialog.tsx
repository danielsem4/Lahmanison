import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

export interface NewCredentials {
  email: string
  password: string
}

interface NewCredentialsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  credentials: NewCredentials | null
}

export function NewCredentialsDialog({
  open,
  onOpenChange,
  credentials,
}: NewCredentialsDialogProps) {
  const { t } = useTranslation('managers')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('credentials.title')}</DialogTitle>
          <DialogDescription>{t('credentials.description')}</DialogDescription>
        </DialogHeader>

        {credentials && (
          <dl className="flex flex-col">
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm font-medium text-muted-foreground">
                {t('credentials.email')}
              </dt>
              <dd className="text-sm font-medium">{credentials.email}</dd>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm font-medium text-muted-foreground">
                {t('credentials.password')}
              </dt>
              <dd className="font-mono text-sm font-medium">{credentials.password}</dd>
            </div>
          </dl>
        )}

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            {t('credentials.done')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
