import { useAuth } from '@/features/auth'
import { ManagersPage } from '@/features/managers'
import { ItemsPage } from '@/features/items'

/**
 * Renders the home screen based on the logged-in user's role.
 * - ADMIN  → table of managers
 * - MANAGER → (future) table of agents
 * - AGENT   → (future) table of patients
 *
 * Until the manager/agent views exist, non-admins fall back to the example
 * items page as a placeholder.
 */
export function RoleHome() {
  const { user } = useAuth()

  if (user?.role === 'ADMIN') {
    return <ManagersPage />
  }

  return <ItemsPage />
}
