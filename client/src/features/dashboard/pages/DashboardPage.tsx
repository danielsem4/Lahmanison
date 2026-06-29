import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { UserPlus, CalendarPlus, ListPlus, Loader2 } from 'lucide-react'
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
import { useAuth } from '@/features/auth'
import { usePatients } from '@/features/patients'
import { PatientFormDialog } from '@/features/patients/components/PatientFormDialog'
import { useCreatePatient } from '@/features/patients/hooks/usePatients'
import type { PatientFormData } from '@/features/patients/schemas/patients.schema'
import {
  useAppointments,
  useCreateAppointment,
  AppointmentFormDialog,
  AppointmentStatusBadge,
  formatDateTime,
} from '@/features/appointments'
import type { AppointmentFormData } from '@/features/appointments/schemas/appointments.schema'
import { useTasks, useCreateTask, TaskFormDialog } from '@/features/tasks'
import type { TaskFormData } from '@/features/tasks/schemas/tasks.schema'

function StatCard({ label, value, loading }: { label: string; value: number; loading: boolean }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        ) : (
          <div className="text-3xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const { t, i18n } = useTranslation('dashboard')
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: patients, isLoading: patientsLoading } = usePatients()
  const { data: appointments, isLoading: appointmentsLoading } = useAppointments()
  const { data: tasks, isLoading: tasksLoading } = useTasks()

  const createPatient = useCreatePatient()
  const createAppointment = useCreateAppointment()
  const createTask = useCreateTask()

  const [patientOpen, setPatientOpen] = useState(false)
  const [appointmentOpen, setAppointmentOpen] = useState(false)
  const [taskOpen, setTaskOpen] = useState(false)

  const myId = user ? Number(user.id) : null
  const myPatients = (patients ?? []).filter((p) => myId !== null && p.createdById === myId)
  const inTreatment = (patients ?? []).filter((p) => p.status === 'IN_TREATMENT')

  const now = Date.now()
  const upcoming = (appointments ?? [])
    .filter((a) => a.status === 'SCHEDULED' && new Date(a.scheduledAt).getTime() >= now)
    .slice(0, 5)
  const openTasks = (tasks ?? []).filter((task) => task.status === 'OPEN')

  function handleCreatePatient(data: PatientFormData) {
    createPatient.mutate(data, { onSuccess: () => setPatientOpen(false) })
  }
  function handleCreateAppointment(data: AppointmentFormData) {
    createAppointment.mutate(data, { onSuccess: () => setAppointmentOpen(false) })
  }
  function handleCreateTask(data: TaskFormData) {
    const { dueDate, ...rest } = data
    createTask.mutate(dueDate ? { ...rest, dueDate } : rest, {
      onSuccess: () => setTaskOpen(false),
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">{t('title', { name: user?.name ?? '' })}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label={t('stats.myPatients')} value={myPatients.length} loading={patientsLoading} />
        <StatCard
          label={t('stats.inTreatment')}
          value={inTreatment.length}
          loading={patientsLoading}
        />
        <StatCard
          label={t('stats.upcomingAppointments')}
          value={
            (appointments ?? []).filter(
              (a) => a.status === 'SCHEDULED' && new Date(a.scheduledAt).getTime() >= now,
            ).length
          }
          loading={appointmentsLoading}
        />
        <StatCard label={t('stats.openTasks')} value={openTasks.length} loading={tasksLoading} />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button onClick={() => setPatientOpen(true)}>
          <UserPlus className="size-4" />
          {t('actions.addPatient')}
        </Button>
        <Button variant="outline" onClick={() => setAppointmentOpen(true)}>
          <CalendarPlus className="size-4" />
          {t('actions.scheduleAppointment')}
        </Button>
        <Button variant="outline" onClick={() => setTaskOpen(true)}>
          <ListPlus className="size-4" />
          {t('actions.addTask')}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('upcoming.title')}</CardTitle>
            <Button variant="link" size="sm" onClick={() => navigate('/appointments')}>
              {t('viewAll')}
            </Button>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : upcoming.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">{t('upcoming.empty')}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('upcoming.patient')}</TableHead>
                    <TableHead>{t('upcoming.when')}</TableHead>
                    <TableHead>{t('upcoming.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {upcoming.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">{a.patient?.name ?? '—'}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTime(a.scheduledAt, i18n.language)}
                      </TableCell>
                      <TableCell>
                        <AppointmentStatusBadge status={a.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t('tasks.title')}</CardTitle>
            <Button variant="link" size="sm" onClick={() => navigate('/tasks')}>
              {t('viewAll')}
            </Button>
          </CardHeader>
          <CardContent>
            {tasksLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : openTasks.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">{t('tasks.empty')}</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('tasks.task')}</TableHead>
                    <TableHead>{t('tasks.patient')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openTasks.slice(0, 5).map((task) => (
                    <TableRow key={task.id}>
                      <TableCell className="font-medium">{task.title}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {task.patient?.name ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <PatientFormDialog
        open={patientOpen}
        onOpenChange={setPatientOpen}
        onSubmit={handleCreatePatient}
        isPending={createPatient.isPending}
      />
      <AppointmentFormDialog
        open={appointmentOpen}
        onOpenChange={setAppointmentOpen}
        onSubmit={handleCreateAppointment}
        isPending={createAppointment.isPending}
      />
      <TaskFormDialog
        open={taskOpen}
        onOpenChange={setTaskOpen}
        onSubmit={handleCreateTask}
        isPending={createTask.isPending}
      />
    </div>
  )
}
