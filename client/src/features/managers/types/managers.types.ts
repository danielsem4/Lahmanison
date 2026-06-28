export interface Manager {
  id: number
  email: string
  name: string | null
  firstName: string | null
  lastName: string | null
  phone: string | null
  role: 'ADMIN' | 'MANAGER' | 'AGENT'
  isActive: boolean
  createdAt: string
  updatedAt: string
}
