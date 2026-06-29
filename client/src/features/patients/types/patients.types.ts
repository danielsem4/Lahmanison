import type {
  AppointmentStatus,
  AppointmentType,
} from '@/features/appointments/types/appointments.types'

export type PatientStatus = 'PENDING' | 'IN_TREATMENT' | 'DISCHARGED'

export interface Patient {
  id: number
  firstName: string
  lastName: string
  name: string
  email: string
  phone: string
  age: number
  hasImage: boolean
  hasFiles: boolean
  status: PatientStatus
  statusNote: string | null
  createdById: number | null
  createdAt: string
  updatedAt: string
  nextAppointment: {
    id: number
    scheduledAt: string
    type: AppointmentType
    status: AppointmentStatus
  } | null
}

export interface PatientFile {
  id: number
  patientId: number
  fileName: string
  storageKey: string
  mimeType: string
  size: number
  uploadedById: number | null
  createdAt: string
}
