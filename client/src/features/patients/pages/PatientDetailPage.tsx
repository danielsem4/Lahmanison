import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Loader2,
  Upload,
  Download,
  Eye,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
import {
  AppointmentFormDialog,
  AppointmentStatusBadge,
  useAppointments,
  useCreateAppointment,
  formatDateTime,
} from '@/features/appointments'
import type { AppointmentFormData } from '@/features/appointments/schemas/appointments.schema'
import { PatientFormDialog } from '../components/PatientFormDialog'
import { FileViewerDialog } from '../components/FileViewerDialog'
import { PatientStatusBadge } from '../components/PatientStatusBadge'
import {
  usePatient,
  useUpdatePatient,
  useDeletePatient,
  usePatientFiles,
  useUploadPatientFile,
  useDeletePatientFile,
} from '../hooks/usePatients'
import { patientFileDownloadUrl } from '../api/patients.api'
import type { Patient, PatientFile } from '../types/patients.types'
import type { PatientFormData } from '../schemas/patients.schema'

function fullName(patient: Patient): string {
  const name = [patient.firstName, patient.lastName].filter(Boolean).join(' ')
  return name || patient.name || '—'
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function PatientDetailPage() {
  const { t, i18n } = useTranslation('patients')
  const { id } = useParams()
  const navigate = useNavigate()
  const patientId = Number(id)

  const { data: patient, isLoading, isError } = usePatient(patientId)
  const updatePatient = useUpdatePatient()
  const deletePatient = useDeletePatient()

  const { data: files, isLoading: filesLoading } = usePatientFiles(patientId)
  const uploadFile = useUploadPatientFile(patientId)
  const deleteFile = useDeletePatientFile(patientId)

  const { data: appointments, isLoading: appointmentsLoading } = useAppointments(patientId)
  const createAppointment = useCreateAppointment()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [fileToDelete, setFileToDelete] = useState<PatientFile | null>(null)
  const [fileToView, setFileToView] = useState<PatientFile | null>(null)

  function handleSubmit(data: PatientFormData) {
    updatePatient.mutate({ id: patientId, data }, { onSuccess: () => setFormOpen(false) })
  }

  function confirmDelete() {
    deletePatient.mutate(patientId, { onSuccess: () => navigate('/patients') })
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (file) uploadFile.mutate(file)
    // Reset so selecting the same file again still fires onChange.
    event.target.value = ''
  }

  function confirmFileDelete() {
    if (!fileToDelete) return
    deleteFile.mutate(fileToDelete.id, { onSuccess: () => setFileToDelete(null) })
  }

  function handleSchedule(data: AppointmentFormData) {
    createAppointment.mutate(data, { onSuccess: () => setScheduleOpen(false) })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError || !patient) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-muted-foreground">{t('detail.notFound')}</p>
        <Button variant="outline" onClick={() => navigate('/patients')}>
          <ArrowLeft className="size-4" />
          {t('detail.back')}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate('/patients')}>
          <ArrowLeft className="size-4" />
          {t('detail.back')}
        </Button>
        <h1 className="flex-1 text-xl font-semibold">{fullName(patient)}</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setFormOpen(true)}>
            <Pencil className="size-4" />
            {t('actions.edit')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" />
            {t('actions.delete')}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('detail.detailsTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="flex flex-col">
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm font-medium text-muted-foreground">{t('table.name')}</dt>
              <dd className="text-sm font-medium">{fullName(patient)}</dd>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm font-medium text-muted-foreground">{t('table.email')}</dt>
              <dd className="text-sm font-medium">{patient.email}</dd>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm font-medium text-muted-foreground">{t('table.phone')}</dt>
              <dd className="text-sm font-medium">{patient.phone ?? '—'}</dd>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm font-medium text-muted-foreground">{t('table.age')}</dt>
              <dd className="text-sm font-medium">{patient.age}</dd>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm font-medium text-muted-foreground">{t('table.hasImage')}</dt>
              <dd className="text-sm font-medium">{patient.hasImage ? t('yes') : t('no')}</dd>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm font-medium text-muted-foreground">{t('table.status')}</dt>
              <dd className="flex items-center gap-2 text-sm font-medium">
                <PatientStatusBadge status={patient.status} />
                {patient.statusNote && (
                  <span className="text-muted-foreground">{patient.statusNote}</span>
                )}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Files */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>{t('detail.filesTitle')}</CardTitle>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
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
            {uploadFile.isPending ? t('detail.uploading') : t('detail.uploadFile')}
          </Button>
        </CardHeader>
        <CardContent>
          {filesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : !files || files.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">{t('detail.noFiles')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>{t('detail.fileName')}</TableHead>
                  <TableHead className="text-center">{t('detail.fileSize')}</TableHead>
                  <TableHead className="text-center">{t('detail.uploadedAt')}</TableHead>
                  <TableHead className="text-center">{t('table.actions')}</TableHead>
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
                          aria-label={t('detail.view')}
                          onClick={() => setFileToView(file)}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t('detail.download')}
                          onClick={() =>
                            window.open(patientFileDownloadUrl(patientId, file.id), '_blank')
                          }
                        >
                          <Download className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t('actions.delete')}
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

      {/* Meetings & calls */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <CardTitle>{t('detail.appointmentsTitle')}</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setScheduleOpen(true)}>
            <Plus className="size-4" />
            {t('detail.schedule')}
          </Button>
        </CardHeader>
        <CardContent>
          {appointmentsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : !appointments || appointments.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              {t('detail.noAppointments')}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>{t('appointments:table.scheduledAt')}</TableHead>
                  <TableHead className="text-center">{t('appointments:table.type')}</TableHead>
                  <TableHead className="text-center">{t('appointments:table.status')}</TableHead>
                  <TableHead className="text-center">{t('appointments:table.note')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="font-medium">
                      {formatDateTime(appointment.scheduledAt, i18n.language)}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {t(`appointments:type.${appointment.type}`)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <AppointmentStatusBadge status={appointment.status} />
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {appointment.note || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PatientFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        patient={patient}
        onSubmit={handleSubmit}
        isPending={updatePatient.isPending}
      />

      <AppointmentFormDialog
        open={scheduleOpen}
        onOpenChange={setScheduleOpen}
        lockedPatientId={patientId}
        onSubmit={handleSchedule}
        isPending={createAppointment.isPending}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('delete.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('delete.description')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('delete.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>{t('delete.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!fileToDelete}
        onOpenChange={(open) => !open && setFileToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('detail.deleteFileTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('detail.deleteFileDescription')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('delete.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmFileDelete}>{t('delete.confirm')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <FileViewerDialog
        file={fileToView}
        patientId={patientId}
        onOpenChange={(open) => !open && setFileToView(null)}
      />
    </div>
  )
}
