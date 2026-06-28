import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Pencil, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
import { PatientFormDialog } from '../components/PatientFormDialog'
import { PatientStatusBadge } from '../components/PatientStatusBadge'
import { usePatient, useUpdatePatient, useDeletePatient } from '../hooks/usePatients'
import type { Patient } from '../types/patients.types'
import type { PatientFormData } from '../schemas/patients.schema'

function fullName(patient: Patient): string {
  const name = [patient.firstName, patient.lastName].filter(Boolean).join(' ')
  return name || patient.name || '—'
}

export function PatientDetailPage() {
  const { t } = useTranslation('patients')
  const { id } = useParams()
  const navigate = useNavigate()
  const patientId = Number(id)

  const { data: patient, isLoading, isError } = usePatient(patientId)
  const updatePatient = useUpdatePatient()
  const deletePatient = useDeletePatient()

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  function handleSubmit(data: PatientFormData) {
    updatePatient.mutate({ id: patientId, data }, { onSuccess: () => setFormOpen(false) })
  }

  function confirmDelete() {
    deletePatient.mutate(patientId, { onSuccess: () => navigate('/patients') })
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

      <PatientFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        patient={patient}
        onSubmit={handleSubmit}
        isPending={updatePatient.isPending}
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
    </div>
  )
}
