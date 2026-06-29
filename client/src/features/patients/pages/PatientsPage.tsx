import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Eye, Pencil, Trash2, Loader2, Check, Minus } from 'lucide-react'
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
import { SearchInput } from '@/components/ui/search-input'
import { SortableTableHead } from '@/components/ui/sortable-table-head'
import { useTableControls } from '@/hooks/useTableControls'
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
import { formatDateTime } from '@/features/appointments'
import { PatientFormDialog } from '../components/PatientFormDialog'
import { PatientStatusBadge } from '../components/PatientStatusBadge'
import {
  usePatients,
  useCreatePatient,
  useUpdatePatient,
  useDeletePatient,
} from '../hooks/usePatients'
import type { Patient } from '../types/patients.types'
import type { PatientFormData } from '../schemas/patients.schema'

function displayName(patient: Patient): string {
  const name = [patient.firstName, patient.lastName].filter(Boolean).join(' ')
  return name || patient.name || '—'
}

export function PatientsPage() {
  const { t, i18n } = useTranslation('patients')
  const navigate = useNavigate()
  const { data: patients, isLoading } = usePatients()
  const createPatient = useCreatePatient()
  const updatePatient = useUpdatePatient()
  const deletePatient = useDeletePatient()

  const { search, setSearch, sortKey, sortDirection, toggleSort, rows } = useTableControls(
    patients,
    {
      searchText: (p) => [displayName(p), p.email, p.phone].filter(Boolean).join(' '),
      sortAccessors: {
        name: (p) => displayName(p),
        email: (p) => p.email,
        phone: (p) => p.phone,
        age: (p) => p.age,
        status: (p) => p.status,
        nextMeeting: (p) => p.nextAppointment?.scheduledAt ?? null,
      },
    },
  )

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Patient | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Patient | null>(null)

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(patient: Patient) {
    setEditing(patient)
    setFormOpen(true)
  }

  function handleSubmit(data: PatientFormData) {
    if (editing) {
      updatePatient.mutate({ id: editing.id, data }, { onSuccess: () => setFormOpen(false) })
    } else {
      createPatient.mutate(data, { onSuccess: () => setFormOpen(false) })
    }
  }

  function confirmDelete() {
    if (!deleteTarget) return
    deletePatient.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{t('title')}</h1>
          <p className="text-muted-foreground">{t('subtitle')}</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          {t('addPatient')}
        </Button>
      </div>

      <Card className="py-4">
        <CardContent>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t('common:table.searchPlaceholder')}
            aria-label={t('common:table.clearSearch')}
            className="w-full"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('listTitle', { count: patients?.length ?? 0 })}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : !patients || patients.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">{t('empty')}</p>
          ) : rows.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              {t('common:table.noResults')}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <SortableTableHead
                    sortKey="name"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={toggleSort}
                    align="center"
                  >
                    {t('table.name')}
                  </SortableTableHead>
                  <SortableTableHead
                    sortKey="email"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={toggleSort}
                    align="center"
                  >
                    {t('table.email')}
                  </SortableTableHead>
                  <SortableTableHead
                    sortKey="phone"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={toggleSort}
                    align="center"
                  >
                    {t('table.phone')}
                  </SortableTableHead>
                  <SortableTableHead
                    sortKey="age"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={toggleSort}
                    align="center"
                  >
                    {t('table.age')}
                  </SortableTableHead>
                  <TableHead className="text-center">{t('table.hasImage')}</TableHead>
                  <SortableTableHead
                    sortKey="status"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={toggleSort}
                    align="center"
                  >
                    {t('table.status')}
                  </SortableTableHead>
                  <SortableTableHead
                    sortKey="nextMeeting"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={toggleSort}
                    align="center"
                  >
                    {t('table.nextMeeting')}
                  </SortableTableHead>
                  <TableHead className="text-center">{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="text-center font-medium">
                      {displayName(patient)}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {patient.email}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {patient.phone ?? '—'}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {patient.age}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        {patient.hasFiles ? (
                          <Check className="size-4 text-primary" aria-label={t('yes')} />
                        ) : (
                          <Minus className="size-4 text-muted-foreground" aria-label={t('no')} />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <PatientStatusBadge status={patient.status} />
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {patient.nextAppointment
                        ? formatDateTime(patient.nextAppointment.scheduledAt, i18n.language)
                        : '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t('actions.view')}
                          onClick={() => navigate(`/patients/${patient.id}`)}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t('actions.edit')}
                          onClick={() => openEdit(patient)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t('actions.delete')}
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(patient)}
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

      <PatientFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        patient={editing}
        onSubmit={handleSubmit}
        isPending={createPatient.isPending || updatePatient.isPending}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
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
