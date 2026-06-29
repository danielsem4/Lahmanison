import { apiClient } from '@/lib/apiClient'
import type { StoredFile } from '../types/files.types'

export async function getDocuments(): Promise<StoredFile[]> {
  const response = await apiClient.get<StoredFile[]>('/documents')
  return response.data
}

export async function uploadDocument(file: File): Promise<StoredFile> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await apiClient.post<StoredFile>('/documents', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function deleteDocument(id: number): Promise<void> {
  await apiClient.delete(`/documents/${id}`)
}

// Direct download URL. The auth cookie rides along automatically on navigation,
// so an <a href> / window.open triggers an authenticated download.
export function documentDownloadUrl(id: number): string {
  const base = (import.meta.env['VITE_API_URL'] as string | undefined) ?? '/api'
  return `${base}/documents/${id}`
}

// Same endpoint, but served with `Content-Disposition: inline` so the browser
// renders the file (in an <iframe>/<img>) instead of downloading it.
export function documentViewUrl(id: number): string {
  return `${documentDownloadUrl(id)}?disposition=inline`
}
