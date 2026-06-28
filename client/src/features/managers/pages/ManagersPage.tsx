import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Eye, Pencil, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { ManagerFormDialog } from '../components/ManagerFormDialog'
import { ViewManagerDialog } from '../components/ViewManagerDialog'
import {
  NewCredentialsDialog,
  type NewCredentials,
} from '../components/NewCredentialsDialog'
import {
  useManagers,
  useCreateManager,
  useUpdateManager,
  useDeleteManager,
} from '../hooks/useManagers'
import type { Manager } from '../types/managers.types'
import type { ManagerFormData } from '../schemas/managers.schema'

function displayName(manager: Manager): string {
  const name = [manager.firstName, manager.lastName].filter(Boolean).join(' ')
  return name || manager.name || '—'
}

export function ManagersPage() {
  const { t } = useTranslation('managers')
  const { data: managers, isLoading } = useManagers()
  const createManager = useCreateManager()
  const updateManager = useUpdateManager()
  const deleteManager = useDeleteManager()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Manager | null>(null)
  const [viewing, setViewing] = useState<Manager | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Manager | null>(null)
  const [credentials, setCredentials] = useState<NewCredentials | null>(null)

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(manager: Manager) {
    setEditing(manager)
    setFormOpen(true)
  }

  function handleSubmit(data: ManagerFormData) {
    if (editing) {
      updateManager.mutate(
        { id: editing.id, data },
        { onSuccess: () => setFormOpen(false) },
      )
    } else {
      createManager.mutate(data, {
        onSuccess: (res) => {
          setFormOpen(false)
          setCredentials({ email: res.manager.email, password: res.password })
        },
      })
    }
  }

  function confirmDelete() {
    if (!deleteTarget) return
    deleteManager.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>{t('title')}</CardTitle>
          <CardDescription>{t('subtitle')}</CardDescription>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          {t('addManager')}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : !managers || managers.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">{t('empty')}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.name')}</TableHead>
                <TableHead>{t('table.phone')}</TableHead>
                <TableHead>{t('table.email')}</TableHead>
                <TableHead className="text-end">{t('table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {managers.map((manager) => (
                <TableRow key={manager.id}>
                  <TableCell className="font-medium">{displayName(manager)}</TableCell>
                  <TableCell className="text-muted-foreground">{manager.phone ?? '—'}</TableCell>
                  <TableCell className="text-muted-foreground">{manager.email}</TableCell>
                  <TableCell className="text-end">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={t('actions.view')}
                        onClick={() => setViewing(manager)}
                      >
                        <Eye className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={t('actions.edit')}
                        onClick={() => openEdit(manager)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        aria-label={t('actions.delete')}
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(manager)}
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

      <ManagerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        manager={editing}
        onSubmit={handleSubmit}
        isPending={createManager.isPending || updateManager.isPending}
      />

      <ViewManagerDialog
        open={!!viewing}
        onOpenChange={(open) => !open && setViewing(null)}
        manager={viewing}
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
    </Card>
  )
}
