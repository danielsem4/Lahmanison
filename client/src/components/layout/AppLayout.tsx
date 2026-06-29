import { Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  LayoutList,
  ListChecks,
  Settings,
  UserRound,
  Users,
} from 'lucide-react'
import { AppSidebar } from '@/components/layout/Sidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { useAuth } from '@/features/auth'
import type { NavItem } from '@/components/layout/Sidebar'

export function AppLayout() {
  const { t } = useTranslation()
  const { user, clearAuth } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await clearAuth()
    navigate('/login')
  }

  let homeNavItem: NavItem
  if (user?.role === 'ADMIN') {
    homeNavItem = { label: t('nav.managers'), path: '/', icon: Users }
  } else if (user?.role === 'MANAGER') {
    homeNavItem = { label: t('nav.agents'), path: '/', icon: Users }
  } else if (user?.role === 'AGENT') {
    homeNavItem = { label: t('nav.dashboard'), path: '/', icon: LayoutDashboard }
  } else {
    homeNavItem = { label: t('nav.items'), path: '/', icon: LayoutList }
  }

  const navItems: NavItem[] = [homeNavItem]

  // Managers additionally get the patients and analytics screens.
  if (user?.role === 'MANAGER') {
    navItems.push(
      { label: t('nav.patients'), path: '/patients', icon: UserRound },
      { label: t('nav.analytics'), path: '/analytics', icon: BarChart3 },
    )
  }

  // Agents work out of a patients/appointments/tasks workspace.
  if (user?.role === 'AGENT') {
    navItems.push(
      { label: t('nav.patients'), path: '/patients', icon: UserRound },
      { label: t('nav.appointments'), path: '/appointments', icon: CalendarDays },
      { label: t('nav.tasks'), path: '/tasks', icon: ListChecks },
    )
  }

  navItems.push({ label: t('nav.settings'), path: '/settings', icon: Settings })

  // Managers see the brand name in place of their personal name.
  const displayName = user?.role === 'MANAGER' ? t('appName') : (user?.name ?? '')

  return (
    <SidebarProvider className="max-h-svh">
      <AppSidebar navItems={navItems} onLogout={handleLogout} userName={displayName} />

      <SidebarInset className="overflow-hidden">
        <header className="flex h-14 items-center gap-2 border-b border-border bg-card px-4">
          <SidebarTrigger className="-ms-1" />
        </header>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto bg-background p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
