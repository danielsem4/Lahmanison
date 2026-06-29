import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import axios from 'axios'
import {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  getPatientFiles,
  uploadPatientFile,
  deletePatientFile,
} from '../api/patients.api'
import type { PatientFormData } from '../schemas/patients.schema'

const patientsKey = ['patients'] as const
const patientFilesKey = (id: number) => [...patientsKey, id, 'files'] as const

function useErrorToast() {
  const { t } = useTranslation('patients')
  return (error: unknown) => {
    const message =
      axios.isAxiosError(error) && error.response?.data?.message
        ? String(error.response.data.message)
        : t('toast.error')
    toast.error(message)
  }
}

export function usePatients() {
  return useQuery({ queryKey: patientsKey, queryFn: getPatients })
}

export function usePatient(id: number) {
  return useQuery({
    queryKey: [...patientsKey, id],
    queryFn: () => getPatient(id),
    enabled: id > 0,
  })
}

export function useCreatePatient() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('patients')
  const onError = useErrorToast()

  return useMutation({
    mutationFn: (data: PatientFormData) => createPatient(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: patientsKey })
      toast.success(t('toast.created'))
    },
    onError,
  })
}

export function useUpdatePatient() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('patients')
  const onError = useErrorToast()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: PatientFormData }) => updatePatient(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: patientsKey })
      toast.success(t('toast.updated'))
    },
    onError,
  })
}

export function useDeletePatient() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('patients')
  const onError = useErrorToast()

  return useMutation({
    mutationFn: (id: number) => deletePatient(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: patientsKey })
      toast.success(t('toast.deleted'))
    },
    onError,
  })
}

// ─── Patient files ───────────────────────────────────────

export function usePatientFiles(id: number) {
  return useQuery({
    queryKey: patientFilesKey(id),
    queryFn: () => getPatientFiles(id),
    enabled: id > 0,
  })
}

export function useUploadPatientFile(patientId: number) {
  const queryClient = useQueryClient()
  const { t } = useTranslation('patients')
  const onError = useErrorToast()

  return useMutation({
    mutationFn: (file: File) => uploadPatientFile(patientId, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: patientFilesKey(patientId) })
      toast.success(t('toast.fileUploaded'))
    },
    onError,
  })
}

export function useDeletePatientFile(patientId: number) {
  const queryClient = useQueryClient()
  const { t } = useTranslation('patients')
  const onError = useErrorToast()

  return useMutation({
    mutationFn: (fileId: number) => deletePatientFile(patientId, fileId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: patientFilesKey(patientId) })
      toast.success(t('toast.fileDeleted'))
    },
    onError,
  })
}
