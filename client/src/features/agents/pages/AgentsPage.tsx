import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Plus, Eye, Pencil, Trash2, Loader2 } from 'lucide-react'
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
import { AgentFormDialog } from '../components/AgentFormDialog'
import {
  NewCredentialsDialog,
  type NewCredentials,
} from '../components/NewCredentialsDialog'
import {
  useAgents,
  useCreateAgent,
  useUpdateAgent,
  useDeleteAgent,
} from '../hooks/useAgents'
import type { Agent } from '../types/agents.types'
import type { AgentFormData } from '../schemas/agents.schema'

function displayName(agent: Agent): string {
  const name = [agent.firstName, agent.lastName].filter(Boolean).join(' ')
  return name || agent.name || '—'
}

export function AgentsPage() {
  const { t } = useTranslation('agents')
  const navigate = useNavigate()
  const { data: agents, isLoading } = useAgents()
  const createAgent = useCreateAgent()
  const updateAgent = useUpdateAgent()
  const deleteAgent = useDeleteAgent()

  const { search, setSearch, sortKey, sortDirection, toggleSort, rows } = useTableControls(
    agents,
    {
      searchText: (a) => [displayName(a), a.email, a.phone].filter(Boolean).join(' '),
      sortAccessors: {
        name: (a) => displayName(a),
        phone: (a) => a.phone,
        email: (a) => a.email,
      },
    },
  )

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Agent | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Agent | null>(null)
  const [credentials, setCredentials] = useState<NewCredentials | null>(null)

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(agent: Agent) {
    setEditing(agent)
    setFormOpen(true)
  }

  function handleSubmit(data: AgentFormData) {
    if (editing) {
      updateAgent.mutate(
        { id: editing.id, data },
        { onSuccess: () => setFormOpen(false) },
      )
    } else {
      createAgent.mutate(data, {
        onSuccess: (res) => {
          setFormOpen(false)
          setCredentials({ email: res.agent.email, password: res.password })
        },
      })
    }
  }

  function confirmDelete() {
    if (!deleteTarget) return
    deleteAgent.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
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
          {t('addAgent')}
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
          <CardTitle>{t('listTitle', { count: agents?.length ?? 0 })}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : !agents || agents.length === 0 ? (
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
                    sortKey="phone"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={toggleSort}
                    align="center"
                  >
                    {t('table.phone')}
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
                  <TableHead className="text-center">{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((agent) => (
                  <TableRow key={agent.id}>
                    <TableCell className="text-center font-medium">
                      {displayName(agent)}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {agent.phone ?? '—'}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {agent.email}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t('actions.view')}
                          onClick={() => navigate(`/agents/${agent.id}`)}
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t('actions.edit')}
                          onClick={() => openEdit(agent)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t('actions.delete')}
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(agent)}
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

      <AgentFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        agent={editing}
        onSubmit={handleSubmit}
        isPending={createAgent.isPending || updateAgent.isPending}
      />

      <NewCredentialsDialog
        open={!!credentials}
        onOpenChange={(open) => !open && setCredentials(null)}
        credentials={credentials}
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
