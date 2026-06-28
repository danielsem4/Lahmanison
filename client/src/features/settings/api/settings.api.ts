import { apiClient } from '@/lib/apiClient'

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export async function changePassword(data: ChangePasswordPayload): Promise<void> {
  await apiClient.patch('/auth/change-password', data)
}
