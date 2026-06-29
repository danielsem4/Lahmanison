import { useTranslation } from 'react-i18next'
import { Download } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { patientFileDownloadUrl, patientFileViewUrl } from '../api/patients.api'
import type { PatientFile } from '../types/patients.types'

interface FileViewerDialogProps {
  file: PatientFile | null
  patientId: number
  onOpenChange: (open: boolean) => void
}

export function FileViewerDialog({ file, patientId, onOpenChange }: FileViewerDialogProps) {
  return (
    <Dialog open={!!file} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        {file && (
          <>
            <DialogHeader>
              <DialogTitle className="truncate pe-8">{file.fileName}</DialogTitle>
            </DialogHeader>
            <div className="h-[75vh] overflow-auto rounded-md border bg-muted/30">
              <FilePreview file={file} patientId={patientId} />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function FilePreview({ file, patientId }: { file: PatientFile; patientId: number }) {
  const { t } = useTranslation('patients')
  const url = patientFileViewUrl(patientId, file.id)

  // Must mirror the server's inline allowlist (files.controller.ts canRenderInline);
  // other types are served as attachments and would download instead of render.
  if (file.mimeType === 'application/pdf' || file.mimeType === 'text/plain') {
    return <iframe src={url} title={file.fileName} className="h-full w-full" />
  }

  if (file.mimeType.startsWith('image/') && file.mimeType !== 'image/svg+xml') {
    return (
      <div className="flex h-full w-full items-center justify-center p-4">
        <img
          src={url}
          alt={file.fileName}
          className="mx-auto max-h-full max-w-full object-contain"
        />
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-4 text-center">
      <p className="text-muted-foreground">{t('detail.previewUnavailable')}</p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => window.open(patientFileDownloadUrl(patientId, file.id), '_blank')}
      >
        <Download className="size-4" />
        {t('detail.download')}
      </Button>
    </div>
  )
}
