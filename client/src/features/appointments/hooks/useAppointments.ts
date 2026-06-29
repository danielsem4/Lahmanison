import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import axios from 'axios'
import {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
} from '../api/appointments.api'
import type { AppointmentFormData } from '../schemas/appointments.schema'

const appointmentsKey = ['appointments'] as const

function useErrorToast() {
  const { t } = useTranslation('appointments')
  return (error: unknown) => {
    const message =
      axios.isAxiosError(error) && error.response?.data?.message
        ? String(error.response.data.message)
        : t('toast.error')
    toast.error(message)
  }
}

export function useAppointments(patientId?: number) {
  return useQuery({
    queryKey: patientId ? [...appointmentsKey, 'patient', patientId] : appointmentsKey,
    queryFn: () => getAppointments(patientId),
  })
}

export function useAppointment(id: number) {
  return useQuery({
    queryKey: [...appointmentsKey, id],
    queryFn: () => getAppointment(id),
    enabled: id > 0,
  })
}

export function useCreateAppointment() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('appointments')
  const onError = useErrorToast()

  return useMutation({
    mutationFn: (data: AppointmentFormData) => createAppointment(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: appointmentsKey })
      toast.success(t('toast.created'))
    },
    onError,
  })
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('appointments')
  const onError = useErrorToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AppointmentFormData> }) =>
      updateAppointment(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: appointmentsKey })
      toast.success(t('toast.updated'))
    },
    onError,
  })
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('appointments')
  const onError = useErrorToast()

  return useMutation({
    mutationFn: (id: number) => deleteAppointment(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: appointmentsKey })
      toast.success(t('toast.deleted'))
    },
    onError,
  })
}
