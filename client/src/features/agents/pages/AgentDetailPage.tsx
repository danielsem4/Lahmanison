import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Pencil, Trash2, Loader2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { AgentFormDialog } from '../components/AgentFormDialog'
import { useAgent, useUpdateAgent, useDeleteAgent } from '../hooks/useAgents'
import { usePatients } from '@/features/patients/hooks/usePatients'
import { PatientStatusBadge } from '@/features/patients/components/PatientStatusBadge'
import type { Patient } from '@/features/patients/types/patients.types'
import type { Agent } from '../types/agents.types'
import type { AgentFormData } from '../schemas/agents.schema'

function fullName(agent: Agent): string {
  const name = [agent.firstName, agent.lastName].filter(Boolean).join(' ')
  return name || agent.name || '—'
}

function patientName(patient: Patient): string {
  const name = [patient.firstName, patient.lastName].filter(Boolean).join(' ')
  return name || patient.name || '—'
}

export function AgentDetailPage() {
  const { t, i18n } = useTranslation('agents')
  const { id } = useParams()
  const navigate = useNavigate()
  const agentId = Number(id)

  const { data: agent, isLoading, isError } = useAgent(agentId)
  const { data: patients, isLoading: patientsLoading } = usePatients()
  const updateAgent = useUpdateAgent()
  const deleteAgent = useDeleteAgent()

  const agentPatients = (patients ?? []).filter((p) => p.createdById === agentId)
  const inTreatmentCount = agentPatients.filter((p) => p.status === 'IN_TREATMENT').length

  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  function handleSubmit(data: AgentFormData) {
    updateAgent.mutate(
      { id: agentId, data },
      { onSuccess: () => setFormOpen(false) },
    )
  }

  function confirmDelete() {
    deleteAgent.mutate(agentId, { onSuccess: () => navigate('/agents') })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (isError || !agent) {
    return (
      <div className="flex flex-col items-center gap-4 py-12">
        <p className="text-muted-foreground">{t('detail.notFound')}</p>
        <Button variant="outline" onClick={() => navigate('/agents')}>
          <ArrowLeft className="size-4" />
          {t('detail.back')}
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => navigate('/agents')}>
          <ArrowLeft className="size-4" />
          {t('detail.back')}
        </Button>
        <h1 className="flex-1 text-xl font-semibold">{fullName(agent)}</h1>
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
              <dd className="text-sm font-medium">{fullName(agent)}</dd>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm font-medium text-muted-foreground">{t('table.email')}</dt>
              <dd className="text-sm font-medium">{agent.email}</dd>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm font-medium text-muted-foreground">{t('table.phone')}</dt>
              <dd className="text-sm font-medium">{agent.phone ?? '—'}</dd>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm font-medium text-muted-foreground">{t('detail.role')}</dt>
              <dd className="text-sm font-medium">{t(`roles.${agent.role}`)}</dd>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm font-medium text-muted-foreground">{t('detail.status')}</dt>
              <dd className="text-sm font-medium">
                <Badge variant={agent.isActive ? 'default' : 'outline'}>
                  {agent.isActive ? t('detail.active') : t('detail.inactive')}
                </Badge>
              </dd>
            </div>
            <Separator />
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm font-medium text-muted-foreground">{t('detail.createdAt')}</dt>
              <dd className="text-sm font-medium">
                {new Date(agent.createdAt).toLocaleDateString(i18n.language)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('detail.patientsAdded')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patientsLoading ? (
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-3xl font-bold">{agentPatients.length}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('detail.patientsInTreatment')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {patientsLoading ? (
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            ) : (
              <div className="text-3xl font-bold">{inTreatmentCount}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('detail.patientsListTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          {patientsLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : agentPatients.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">{t('detail.noPatients')}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-center">{t('patients:table.name')}</TableHead>
                  <TableHead className="text-center">{t('patients:table.email')}</TableHead>
                  <TableHead className="text-center">{t('patients:table.phone')}</TableHead>
                  <TableHead className="text-center">{t('patients:table.status')}</TableHead>
                  <TableHead className="text-center">{t('patients:table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agentPatients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="text-center font-medium">
                      {patientName(patient)}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {patient.email}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {patient.phone ?? '—'}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <PatientStatusBadge status={patient.status} />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t('patients:actions.view')}
                          onClick={() => navigate(`/patients/${patient.id}`)}
                        >
                          <Eye className="size-4" />
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

      <AgentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        agent={agent}
        onSubmit={handleSubmit}
        isPending={updateAgent.isPending}
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
