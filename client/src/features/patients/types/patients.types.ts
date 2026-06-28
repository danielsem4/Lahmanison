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
  status: PatientStatus
  statusNote: string | null
  createdAt: string
  updatedAt: string
}
