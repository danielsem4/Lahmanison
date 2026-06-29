export type TaskStatus = 'OPEN' | 'DONE'

export interface Task {
  id: number
  title: string
  description: string | null
  dueDate: string | null
  status: TaskStatus
  patientId: number | null
  patient: { id: number; name: string } | null
  createdById: number | null
  createdAt: string
  updatedAt: string
}
