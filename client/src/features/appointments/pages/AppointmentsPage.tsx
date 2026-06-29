import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
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
import { AppointmentFormDialog } from '../components/AppointmentFormDialog'
import { AppointmentStatusBadge } from '../components/AppointmentStatusBadge'
import {
  useAppointments,
  useCreateAppointment,
  useUpdateAppointment,
  useDeleteAppointment,
} from '../hooks/useAppointments'
import type { Appointment } from '../types/appointments.types'
import type { AppointmentFormData } from '../schemas/appointments.schema'

export function formatDateTime(iso: string, locale: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString(locale === 'he' ? 'he-IL' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function AppointmentsPage() {
  const { t, i18n } = useTranslation('appointments')
  const { data: appointments, isLoading } = useAppointments()
  const createAppointment = useCreateAppointment()
  const updateAppointment = useUpdateAppointment()
  const deleteAppointment = useDeleteAppointment()

  const { search, setSearch, sortKey, sortDirection, toggleSort, rows } = useTableControls(
    appointments,
    {
      searchText: (a) => [a.patient?.name, a.note, a.status].filter(Boolean).join(' '),
      sortAccessors: {
        patient: (a) => a.patient?.name ?? '',
        scheduledAt: (a) => a.scheduledAt,
        status: (a) => a.status,
      },
      initialSort: { key: 'scheduledAt', direction: 'asc' },
    },
  )

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Appointment | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Appointment | null>(null)

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(appointment: Appointment) {
    setEditing(appointment)
    setFormOpen(true)
  }

  function handleSubmit(data: AppointmentFormData) {
    if (editing) {
      updateAppointment.mutate({ id: editing.id, data }, { onSuccess: () => setFormOpen(false) })
    } else {
      createAppointment.mutate(data, { onSuccess: () => setFormOpen(false) })
    }
  }

  function confirmDelete() {
    if (!deleteTarget) return
    deleteAppointment.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
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
          {t('addAppointment')}
        </Button>
      </div>

      <Card className="py-4">
        <CardContent>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={t('searchPlaceholder')}
            className="w-full"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('listTitle', { count: appointments?.length ?? 0 })}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : !appointments || appointments.length === 0 ? (
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
                    sortKey="patient"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={toggleSort}
                    align="center"
                  >
                    {t('table.patient')}
                  </SortableTableHead>
                  <SortableTableHead
                    sortKey="scheduledAt"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={toggleSort}
                    align="center"
                  >
                    {t('table.scheduledAt')}
                  </SortableTableHead>
                  <TableHead className="text-center">{t('table.type')}</TableHead>
                  <SortableTableHead
                    sortKey="status"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={toggleSort}
                    align="center"
                  >
                    {t('table.status')}
                  </SortableTableHead>
                  <TableHead className="text-center">{t('table.note')}</TableHead>
                  <TableHead className="text-center">{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell className="text-center font-medium">
                      {appointment.patient?.name ?? '—'}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {formatDateTime(appointment.scheduledAt, i18n.language)}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {t(`type.${appointment.type}`)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <AppointmentStatusBadge status={appointment.status} />
                      </div>
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {appointment.note || '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t('actions.edit')}
                          onClick={() => openEdit(appointment)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t('actions.delete')}
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(appointment)}
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

      <AppointmentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        appointment={editing}
        onSubmit={handleSubmit}
        isPending={createAppointment.isPending || updateAppointment.isPending}
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
