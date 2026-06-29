import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2, Upload, Download, Eye, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { FileViewerDialog } from '@/components/shared/FileViewerDialog'
import { formatDateTime } from '@/features/appointments'
import { useDocuments, useUploadDocument, useDeleteDocument } from '../hooks/useFiles'
import { documentDownloadUrl, documentViewUrl } from '../api/files.api'
import type { StoredFile } from '../types/files.types'

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FilesPage() {
  const { t, i18n } = useTranslation('files')

  const { data: files, isLoading } = useDocuments()
  const uploadFile = useUploadDocument()
  const deleteFile = useDeleteDocument()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileToDelete, setFileToDelete] = useState<StoredFile | null>(null)
  const [fileToView, setFileToView] = useState<StoredFile | null>(null)

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) uploadFile.mutate(file)
    // Reset so selecting the same file again still fires onChange.
    event.target.value = ''
  }

  function confirmDelete() {
    if (!fileToDelete) return
    deleteFile.mutate(fileToDelete.id, { onSuccess: () => setFileToDelete(null) })
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">{t('title')}</h1>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>{t('cardTitle')}</CardTitle>
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChange} />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadFile.isPending}
          >
            {uploadFile.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Upload className="size-4" />
            )}
            {uploadFile.isPending ? t('uploading') : t('upload')}
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : !files || files.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">{t('empty')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>{t('fileName')}</TableHead>
                  <TableHead className="text-center">{t('fileSize')}</TableHead>
                  <TableHead className="text-center">{t('uploadedAt')}</TableHead>
                  <TableHead className="text-center">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {files.map((file) => (
                  <TableRow key={file.id}>
                    <TableCell className="font-medium">{file.fileName}</TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {formatSize(file.size)}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {formatDateTime(file.createdAt, i18n.language)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t('view')}
                          onClick={() => setFileToView(file)}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t('download')}
                          onClick={() => window.open(documentDownloadUrl(file.id), '_blank')}
                        >
                          <Download className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t('delete')}
                          className="text-destructive hover:text-destructive"
                          onClick={() => setFileToDelete(file)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!fileToDelete} onOpenChange={(open) => !open && setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('deleteDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>{t('confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <FileViewerDialog
        file={fileToView}
        viewUrl={fileToView ? documentViewUrl(fileToView.id) : null}
        downloadUrl={fileToView ? documentDownloadUrl(fileToView.id) : null}
        onOpenChange={(open) => !open && setFileToView(null)}
      />
    </div>
  )
}
