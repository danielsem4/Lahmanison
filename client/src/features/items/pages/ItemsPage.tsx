import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react'
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
import { ItemFormDialog } from '../components/ItemFormDialog'
import {
  useItems,
  useCreateItem,
  useUpdateItem,
  useDeleteItem,
} from '../hooks/useItems'
import type { Item } from '../types/items.types'
import type { ItemFormData } from '../schemas/items.schema'

export function ItemsPage() {
  const { t } = useTranslation('items')
  const { data: items, isLoading } = useItems()
  const createItem = useCreateItem()
  const updateItem = useUpdateItem()
  const deleteItem = useDeleteItem()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Item | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null)

  function openCreate() {
    setEditing(null)
    setFormOpen(true)
  }

  function openEdit(item: Item) {
    setEditing(item)
    setFormOpen(true)
  }

  function handleSubmit(data: ItemFormData) {
    if (editing) {
      updateItem.mutate(
        { id: editing.id, data },
        { onSuccess: () => setFormOpen(false) },
      )
    } else {
      createItem.mutate(data, { onSuccess: () => setFormOpen(false) })
    }
  }

  function confirmDelete() {
    if (!deleteTarget) return
    deleteItem.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })
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
          {t('addItem')}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : !items || items.length === 0 ? (
          <p className="py-12 text-center text-muted-foreground">{t('empty')}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('table.title')}</TableHead>
                <TableHead>{t('table.description')}</TableHead>
                <TableHead className="text-end">{t('table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell className="text-muted-foreground">{item.description ?? '—'}</TableCell>
                  <TableCell className="text-end">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon-sm" onClick={() => openEdit(item)}>
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(item)}
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

      <ItemFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        item={editing}
        onSubmit={handleSubmit}
        isPending={createItem.isPending || updateItem.isPending}
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
