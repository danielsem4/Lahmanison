import { useAuth } from '@/features/auth'
import { ManagersPage } from '@/features/managers'
import { AgentsPage } from '@/features/agents'
import { DashboardPage } from '@/features/dashboard'
import { ItemsPage } from '@/features/items'

/**
 * Renders the home screen based on the logged-in user's role.
 * - ADMIN   → table of managers
 * - MANAGER → table of agents
 * - AGENT   → workspace dashboard
 *
 * Any other role falls back to the example items page as a placeholder.
 */
export function RoleHome() {
  const { user } = useAuth()

  if (user?.role === 'ADMIN') {
    return <ManagersPage />
  }

  if (user?.role === 'MANAGER') {
    return <AgentsPage />
  }

  if (user?.role === 'AGENT') {
    return <DashboardPage />
  }

  return <ItemsPage />
}
