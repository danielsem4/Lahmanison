import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import axios from 'axios'
import { changePassword, type ChangePasswordPayload } from '../api/settings.api'

export function useChangePassword() {
  const { t } = useTranslation('settings')

  return useMutation({
    mutationFn: (data: ChangePasswordPayload) => changePassword(data),
    onSuccess: () => {
      toast.success(t('security.toast.success'))
    },
    onError: (error) => {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? String(error.response.data.message)
          : t('security.toast.error')
      toast.error(message)
    },
  })
}
