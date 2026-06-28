import { Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutList, Settings, Users } from 'lucide-react'
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

  const homeNavItem: NavItem =
    user?.role === 'ADMIN'
      ? { label: t('nav.managers'), path: '/', icon: Users }
      : { label: t('nav.items'), path: '/', icon: LayoutList }

  const navItems: NavItem[] = [
    homeNavItem,
    { label: t('nav.settings'), path: '/settings', icon: Settings },
  ]

  return (
    <SidebarProvider className="max-h-svh">
      <AppSidebar navItems={navItems} onLogout={handleLogout} userName={user?.name ?? ''} />

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
