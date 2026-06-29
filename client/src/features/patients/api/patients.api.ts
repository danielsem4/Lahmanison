import { apiClient } from '@/lib/apiClient'
import type { Patient } from '../types/patients.types'
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
