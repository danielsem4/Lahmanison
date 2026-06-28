export type UserRole = 'ADMIN' | 'MANAGER' | 'AGENT'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
}
