export type UserRole = 'ADMIN' | 'USER'

export interface AuthUser {
  id: string
  email: string
  name: string
  role: UserRole
}
