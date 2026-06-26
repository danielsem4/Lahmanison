import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import axios from 'axios'
import {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem,
} from '../api/items.api'
import type { ItemFormData } from '../schemas/items.schema'

const itemsKey = ['items'] as const

function useErrorToast() {
  const { t } = useTranslation('items')
  return (error: unknown) => {
    const message =
      axios.isAxiosError(error) && error.response?.data?.message
        ? String(error.response.data.message)
        : t('toast.error')
    toast.error(message)
  }
}

export function useItems() {
  return useQuery({ queryKey: itemsKey, queryFn: getItems })
}

export function useItem(id: number) {
  return useQuery({ queryKey: [...itemsKey, id], queryFn: () => getItem(id), enabled: id > 0 })
}

export function useCreateItem() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('items')
  const onError = useErrorToast()

  return useMutation({
    mutationFn: (data: ItemFormData) => createItem(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: itemsKey })
      toast.success(t('toast.created'))
    },
    onError,
  })
}

export function useUpdateItem() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('items')
  const onError = useErrorToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ItemFormData }) => updateItem(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: itemsKey })
      toast.success(t('toast.updated'))
    },
    onError,
  })
}

export function useDeleteItem() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('items')
  const onError = useErrorToast()

  return useMutation({
    mutationFn: (id: number) => deleteItem(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: itemsKey })
      toast.success(t('toast.deleted'))
    },
    onError,
  })
}
