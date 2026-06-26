import { apiClient } from '@/lib/apiClient'
import type { Item } from '../types/items.types'
import type { ItemFormData } from '../schemas/items.schema'

export async function getItems(): Promise<Item[]> {
  const response = await apiClient.get<Item[]>('/items')
  return response.data
}

export async function getItem(id: number): Promise<Item> {
  const response = await apiClient.get<Item>(`/items/${id}`)
  return response.data
}

export async function createItem(data: ItemFormData): Promise<Item> {
  const response = await apiClient.post<Item>('/items', data)
  return response.data
}

export async function updateItem(id: number, data: ItemFormData): Promise<Item> {
  const response = await apiClient.patch<Item>(`/items/${id}`, data)
  return response.data
}

export async function deleteItem(id: number): Promise<void> {
  await apiClient.delete(`/items/${id}`)
}
