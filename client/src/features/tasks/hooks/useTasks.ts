import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import axios from 'axios'
import { getTasks, getTask, createTask, updateTask, deleteTask } from '../api/tasks.api'
import type { TaskFormData } from '../schemas/tasks.schema'

const tasksKey = ['tasks'] as const

function useErrorToast() {
  const { t } = useTranslation('tasks')
  return (error: unknown) => {
    const message =
      axios.isAxiosError(error) && error.response?.data?.message
        ? String(error.response.data.message)
        : t('toast.error')
    toast.error(message)
  }
}

export function useTasks() {
  return useQuery({ queryKey: tasksKey, queryFn: getTasks })
}

export function useTask(id: number) {
  return useQuery({
    queryKey: [...tasksKey, id],
    queryFn: () => getTask(id),
    enabled: id > 0,
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('tasks')
  const onError = useErrorToast()

  return useMutation({
    mutationFn: (data: TaskFormData) => createTask(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tasksKey })
      toast.success(t('toast.created'))
    },
    onError,
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('tasks')
  const onError = useErrorToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TaskFormData> }) =>
      updateTask(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tasksKey })
      toast.success(t('toast.updated'))
    },
    onError,
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('tasks')
  const onError = useErrorToast()

  return useMutation({
    mutationFn: (id: number) => deleteTask(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: tasksKey })
      toast.success(t('toast.deleted'))
    },
    onError,
  })
}
