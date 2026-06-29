import { apiClient } from '@/lib/apiClient'
import type { Appointment } from '../types/appointments.types'
import type { AppointmentFormData } from '../schemas/appointments.schema'

export async function getAppointments(patientId?: number): Promise<Appointment[]> {
  const response = await apiClient.get<Appointment[]>('/appointments', {
    params: patientId ? { patientId } : undefined,
  })
  return response.data
}

export async function getAppointment(id: number): Promise<Appointment> {
  const response = await apiClient.get<Appointment>(`/appointments/${id}`)
  return response.data
}

export async function createAppointment(data: AppointmentFormData): Promise<Appointment> {
  const response = await apiClient.post<Appointment>('/appointments', data)
  return response.data
}

export async function updateAppointment(
  id: number,
  data: Partial<AppointmentFormData>,
): Promise<Appointment> {
  const response = await apiClient.patch<Appointment>(`/appointments/${id}`, data)
  return response.data
}

export async function deleteAppointment(id: number): Promise<void> {
  await apiClient.delete(`/appointments/${id}`)
}
