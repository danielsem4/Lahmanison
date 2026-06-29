import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, Loader2, CheckCircle2, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { TaskFormDialog } from '../components/TaskFormDialog'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks'
import type { Task } from '../types/tasks.types'
import type { TaskFormData } from '../schemas/tasks.schema'

// Drop the empty due-date string so the server doesn't try to coerce '' to a Date.
function cleanPayload(data: TaskFormData): TaskFormData {
  const { dueDate, ...rest } = data
  return dueDate ? { ...rest, dueDate } : rest
}

function formatDate(iso: string | null, locale: string): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(locale === 'he' ? 'he-IL' : 'en-US', { dateStyle: 'medium' })
}

export function TasksPage() {
  const { t, i18n } = useTranslation('tasks')
  const { data: tasks, isLoading } = useTasks()
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  const { search, setSearch, sortKey, sortDirection, toggleSort, rows } = useTableControls(tasks, {
    searchText: (task) => [task.title, task.patient?.name, task.description].filter(Boolean).join(' '),
    sortAccessors: {
      title: (task) => task.title,
      patient: (task) => task.patient?.name ?? '',
      dueDate: (task) => task.dueDate ?? '',
      status: (task) => task.status,
    },
  })

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Task | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null)

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(task: Task) {
    setEditing(task)
    setFormOpen(true)
  }

  function handleSubmit(data: TaskFormData) {
    const payload = cleanPayload(data)
    if (editing) {
      updateTask.mutate({ id: editing.id, data: payload }, { onSuccess: () => setFormOpen(false) })
    } else {
      createTask.mutate(payload, { onSuccess: () => setFormOpen(false) })
    }
  }

  function toggleStatus(task: Task) {
    updateTask.mutate({ id: task.id, data: { status: task.status === 'OPEN' ? 'DONE' : 'OPEN' } })
  }

  function confirmDelete() {
    if (!deleteTarget) return
    deleteTask.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
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
          {t('addTask')}
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
          <CardTitle>{t('listTitle', { count: tasks?.length ?? 0 })}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : !tasks || tasks.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">{t('empty')}</p>
          ) : rows.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">
              {t('common:table.noResults')}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="text-center">{t('table.done')}</TableHead>
                  <SortableTableHead
                    sortKey="title"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={toggleSort}
                    align="center"
                  >
                    {t('table.title')}
                  </SortableTableHead>
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
                    sortKey="dueDate"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={toggleSort}
                    align="center"
                  >
                    {t('table.dueDate')}
                  </SortableTableHead>
                  <SortableTableHead
                    sortKey="status"
                    activeKey={sortKey}
                    direction={sortDirection}
                    onSort={toggleSort}
                    align="center"
                  >
                    {t('table.status')}
                  </SortableTableHead>
                  <TableHead className="text-center">{t('table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t('actions.toggle')}
                          onClick={() => toggleStatus(task)}
                        >
                          {task.status === 'DONE' ? (
                            <CheckCircle2 className="size-4 text-primary" />
                          ) : (
                            <Circle className="size-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell
                      className={`text-center font-medium ${
                        task.status === 'DONE' ? 'text-muted-foreground line-through' : ''
                      }`}
                    >
                      {task.title}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {task.patient?.name ?? '—'}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      {formatDate(task.dueDate, i18n.language)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center">
                        <Badge variant={task.status === 'DONE' ? 'outline' : 'secondary'}>
                          {t(`status.${task.status}`)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t('actions.edit')}
                          onClick={() => openEdit(task)}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={t('actions.delete')}
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(task)}
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

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        task={editing}
        onSubmit={handleSubmit}
        isPending={createTask.isPending || updateTask.isPending}
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
