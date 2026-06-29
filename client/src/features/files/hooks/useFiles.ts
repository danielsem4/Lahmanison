import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import axios from 'axios'
import { getDocuments, uploadDocument, deleteDocument } from '../api/files.api'

const documentsKey = ['documents'] as const

function useErrorToast() {
  const { t } = useTranslation('files')
  return (error: unknown) => {
    const message =
      axios.isAxiosError(error) && error.response?.data?.message
        ? String(error.response.data.message)
        : t('toast.error')
    toast.error(message)
  }
}

export function useDocuments() {
  return useQuery({ queryKey: documentsKey, queryFn: getDocuments })
}

export function useUploadDocument() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('files')
  const onError = useErrorToast()

  return useMutation({
    mutationFn: (file: File) => uploadDocument(file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentsKey })
      toast.success(t('toast.uploaded'))
    },
    onError,
  })
}

export function useDeleteDocument() {
  const queryClient = useQueryClient()
  const { t } = useTranslation('files')
  const onError = useErrorToast()

  return useMutation({
    mutationFn: (id: number) => deleteDocument(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: documentsKey })
      toast.success(t('toast.deleted'))
    },
    onError,
  })
}
