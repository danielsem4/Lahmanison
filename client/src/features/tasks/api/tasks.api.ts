import { apiClient } from '@/lib/apiClient'
import type { Task } from '../types/tasks.types'
import type { TaskFormData } from '../schemas/tasks.schema'

export async function getTasks(): Promise<Task[]> {
  const response = await apiClient.get<Task[]>('/tasks')
  return response.data
}

export async function getTask(id: number): Promise<Task> {
  const response = await apiClient.get<Task>(`/tasks/${id}`)
  return response.data
}

export async function createTask(data: TaskFormData): Promise<Task> {
  const response = await apiClient.post<Task>('/tasks', data)
  return response.data
}

export async function updateTask(id: number, data: Partial<TaskFormData>): Promise<Task> {
  const response = await apiClient.patch<Task>(`/tasks/${id}`, data)
  return response.data
}

export async function deleteTask(id: number): Promise<void> {
  await apiClient.delete(`/tasks/${id}`)
}
