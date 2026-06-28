import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import axios from 'axios'
import {
  getAgents,
  getAgent,
  createAgent,
  updateAgent,
  deleteAgent,
} from '../api/agents.api'
import type { AgentFormData } from '../schemas/agents.schema'

const agentsKey = ['agents'] as const

function useErrorToast() {
  const { t } = useTranslation('agents')
  return (error: unknown) => {
    const message =
      axios.isAxiosError(error) && error.response?.data?.message
        ? String(error.response.data.message)
        : t('toast.error')
    toast.error(message)
  }
}

export function useAgents() {
  return useQuery({ queryKey: agentsKey, queryFn: getAgents })
}

export function useAgent(id: number) {
  return useQuery({
    queryKey: [...agentsKey, id],
    queryFn: () => getAgent(id),
    enabled: id > 0,
  })
}

export function useCreateAgent() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('agents')
  const onError = useErrorToast()

  return useMutation({
    mutationFn: (data: AgentFormData) => createAgent(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: agentsKey })
      toast.success(t('toast.created'))
    },
    onError,
  })
}

export function useUpdateAgent() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('agents')
  const onError = useErrorToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AgentFormData }) => updateAgent(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: agentsKey })
      toast.success(t('toast.updated'))
    },
    onError,
  })
}

export function useDeleteAgent() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('agents')
  const onError = useErrorToast()

  return useMutation({
    mutationFn: (id: number) => deleteAgent(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: agentsKey })
      toast.success(t('toast.deleted'))
    },
    onError,
  })
}
