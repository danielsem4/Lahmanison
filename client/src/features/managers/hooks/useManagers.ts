import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import axios from 'axios'
import {
  getManagers,
  getManager,
  createManager,
  updateManager,
  deleteManager,
} from '../api/managers.api'
import type { ManagerFormData } from '../schemas/managers.schema'

const managersKey = ['managers'] as const

function useErrorToast() {
  const { t } = useTranslation('managers')
  return (error: unknown) => {
    const message =
      axios.isAxiosError(error) && error.response?.data?.message
        ? String(error.response.data.message)
        : t('toast.error')
    toast.error(message)
  }
}

export function useManagers() {
  return useQuery({ queryKey: managersKey, queryFn: getManagers })
}

export function useManager(id: number) {
  return useQuery({
    queryKey: [...managersKey, id],
    queryFn: () => getManager(id),
    enabled: id > 0,
  })
}

export function useCreateManager() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('managers')
  const onError = useErrorToast()

  return useMutation({
    mutationFn: (data: ManagerFormData) => createManager(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: managersKey })
      toast.success(t('toast.created'))
    },
    onError,
  })
}

export function useUpdateManager() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('managers')
  const onError = useErrorToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ManagerFormData }) => updateManager(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: managersKey })
      toast.success(t('toast.updated'))
    },
    onError,
  })
}

export function useDeleteManager() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('managers')
  const onError = useErrorToast()

  return useMutation({
    mutationFn: (id: number) => deleteManager(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: managersKey })
      toast.success(t('toast.deleted'))
    },
    onError,
  })
}
