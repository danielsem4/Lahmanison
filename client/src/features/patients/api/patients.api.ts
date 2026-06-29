import { apiClient } from '@/lib/apiClient'
import type { Patient, PatientFile } from '../types/patients.types'
import type { PatientFormData } from '../schemas/patients.schema'

export async function getPatients(): Promise<Patient[]> {
  const response = await apiClient.get<Patient[]>('/patients')
  return response.data
}

export async function getPatient(id: number): Promise<Patient> {
  const response = await apiClient.get<Patient>(`/patients/${id}`)
  return response.data
}

export async function createPatient(data: PatientFormData): Promise<Patient> {
  const response = await apiClient.post<Patient>('/patients', data)
  return response.data
}

export async function updatePatient(id: number, data: PatientFormData): Promise<Patient> {
  const response = await apiClient.patch<Patient>(`/patients/${id}`, data)
  return response.data
}

export async function deletePatient(id: number): Promise<void> {
  await apiClient.delete(`/patients/${id}`)
}

// ─── Patient files ───────────────────────────────────────

export async function getPatientFiles(patientId: number): Promise<PatientFile[]> {
  const response = await apiClient.get<PatientFile[]>(`/patients/${patientId}/files`)
  return response.data
}

export async function uploadPatientFile(patientId: number, file: File): Promise<PatientFile> {
  const formData = new FormData()
  formData.append('file', file)
  const response = await apiClient.post<PatientFile>(
    `/patients/${patientId}/files`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } },
  )
  return response.data
}

export async function deletePatientFile(patientId: number, fileId: number): Promise<void> {
  await apiClient.delete(`/patients/${patientId}/files/${fileId}`)
}

// Direct download URL. The auth cookie rides along automatically on navigation,
// so an <a href> / window.open triggers an authenticated download.
export function patientFileDownloadUrl(patientId: number, fileId: number): string {
  const base = (import.meta.env['VITE_API_URL'] as string | undefined) ?? '/api'
  return `${base}/patients/${patientId}/files/${fileId}`
}

// Same endpoint, but served with `Content-Disposition: inline` so the browser
// renders the file (in an <iframe>/<img>) instead of downloading it.
export function patientFileViewUrl(patientId: number, fileId: number): string {
  return `${patientFileDownloadUrl(patientId, fileId)}?disposition=inline`
}
