import { apiClient } from '@/lib/apiClient'
import type { Manager } from '../types/managers.types'
import type { ManagerFormData } from '../schemas/managers.schema'

export interface CreateManagerResponse {
  manager: Manager
  // Dev-only: server returns the generated password while email delivery is stubbed.
  password: string
}

export async function getManagers(): Promise<Manager[]> {
  const response = await apiClient.get<Manager[]>('/managers')
  return response.data
}

export async function getManager(id: number): Promise<Manager> {
  const response = await apiClient.get<Manager>(`/managers/${id}`)
  return response.data
}

export async function createManager(data: ManagerFormData): Promise<CreateManagerResponse> {
  const response = await apiClient.post<CreateManagerResponse>('/managers', data)
  return response.data
}

export async function updateManager(id: number, data: ManagerFormData): Promise<Manager> {
  const response = await apiClient.patch<Manager>(`/managers/${id}`, data)
  return response.data
}

export async function deleteManager(id: number): Promise<void> {
  await apiClient.delete(`/managers/${id}`)
}
