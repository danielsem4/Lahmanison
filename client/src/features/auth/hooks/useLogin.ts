import { useMutation } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import axios from 'axios'
import { loginUser } from '../api/auth.api'
import { useAuth } from './useAuth'
import type { LoginFormData } from '../schemas/auth.schema'

export function useLogin() {
  const { t } = useTranslation('auth')
  const { setUser } = useAuth()

  return useMutation({
    mutationFn: (data: LoginFormData) => loginUser(data),
    onSuccess: (user) => {
      setUser(user)
      toast.success(t('toast.loginSuccess'))
    },
    onError: (error) => {
      const message =
        axios.isAxiosError(error) && error.response?.data?.message
          ? String(error.response.data.message)
          : t('toast.invalidCredentials')
      toast.error(message)
    },
  })
}
