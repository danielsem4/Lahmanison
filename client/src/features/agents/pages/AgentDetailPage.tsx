import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Pencil, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { AgentFormDialog } from '../components/AgentFormDialog'
import { useAgent, useUpdateAgent, useDeleteAgent } from '../hooks/useAgents'
import type { Agent } from '../types/agents.types'
import type { AgentFormData } from '../schemas/agents.schema'

function fullName(agent: Agent): string {
  const name = [agent.firstName, agent.lastName].filter(Boolean).join(' ')
  return name || agent.name || '—'
}

export function AgentDetailPage() {
  const { t } = useTranslation('agents')
  const { id } = useParams()
  const navigate = useNavigate()
  const agentId = Number(id)

  const { data: agent, isLoading, isError } = useAgent(agentId)
  const updateAgent = useUpdateAgent()
  const deleteAgent = useDeleteAgent()

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
          </dl>
        </CardContent>
      </Card>

      {/* Future sections (related patients, sales, etc.) stack below as additional cards. */}

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
