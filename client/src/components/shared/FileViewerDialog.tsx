import { useTranslation } from 'react-i18next'
import { Download } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

export interface ViewableFile {
  fileName: string
  mimeType: string
}

interface FileViewerDialogProps {
  file: ViewableFile | null
  // Inline-render URL (served with Content-Disposition: inline).
  viewUrl: string | null
  // Attachment URL (forces a download).
  downloadUrl: string | null
  onOpenChange: (open: boolean) => void
}

export function FileViewerDialog({ file, viewUrl, downloadUrl, onOpenChange }: FileViewerDialogProps) {
  return (
    <Dialog open={!!file} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        {file && viewUrl && downloadUrl && (
          <>
            <DialogHeader>
              <DialogTitle className="truncate pe-8">{file.fileName}</DialogTitle>
            </DialogHeader>
            <div className="h-[75vh] overflow-auto rounded-md border bg-muted/30">
              <FilePreview file={file} viewUrl={viewUrl} downloadUrl={downloadUrl} />
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

function FilePreview({
  file,
  viewUrl,
  downloadUrl,
}: {
  file: ViewableFile
  viewUrl: string
  downloadUrl: string
}) {
  const { t } = useTranslation()

  // Must mirror the server's inline allowlist (fileResponse.ts canRenderInline);
  // other types are served as attachments and would download instead of render.
  if (file.mimeType === 'application/pdf' || file.mimeType === 'text/plain') {
    return <iframe src={viewUrl} title={file.fileName} className="h-full w-full" />
  }

  if (file.mimeType.startsWith('image/') && file.mimeType !== 'image/svg+xml') {
    return (
      <div className="flex h-full w-full items-center justify-center p-4">
        <img
          src={viewUrl}
          alt={file.fileName}
          className="mx-auto max-h-full max-w-full object-contain"
        />
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-4 text-center">
      <p className="text-muted-foreground">{t('fileViewer.previewUnavailable')}</p>
      <Button variant="outline" size="sm" onClick={() => window.open(downloadUrl, '_blank')}>
        <Download className="size-4" />
        {t('fileViewer.download')}
      </Button>
    </div>
  )
}
