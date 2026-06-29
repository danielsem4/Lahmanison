export type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'

export type AppointmentType = 'MEETING' | 'PHONE_CALL'

export interface Appointment {
  id: number
  patientId: number
  patient: { id: number; name: string } | null
  scheduledAt: string
  type: AppointmentType
  status: AppointmentStatus
  note: string | null
  createdById: number | null
  createdAt: string
  updatedAt: string
}
