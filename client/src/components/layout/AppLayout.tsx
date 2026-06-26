import { Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutList, Languages, Moon, Sun } from 'lucide-react'
import { AppSidebar } from '@/components/layout/Sidebar'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth'
import { useThemeStore } from '@/stores/themeStore'
import type { NavItem } from '@/components/layout/Sidebar'

export function AppLayout() {
  const { t, i18n } = useTranslation()
  const { user, clearAuth } = useAuth()
  const navigate = useNavigate()
  const { theme, setTheme } = useThemeStore()

  async function handleLogout() {
    await clearAuth()
    navigate('/login')
  }

  function toggleLanguage() {
    void i18n.changeLanguage(i18n.language === 'he' ? 'en' : 'he')
  }

  function toggleTheme() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const navItems: NavItem[] = [{ label: t('nav.items'), path: '/items', icon: LayoutList }]

  return (
    <SidebarProvider className="max-h-svh">
      <AppSidebar navItems={navItems} onLogout={handleLogout} userName={user?.name ?? ''} />

      <SidebarInset className="overflow-hidden">
        <header className="flex h-14 items-center gap-2 border-b border-border bg-card px-4">
          <SidebarTrigger className="-ms-1" />
          <div className="ms-auto flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={toggleLanguage} aria-label="Toggle language">
              <Languages className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </Button>
          </div>
        </header>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto bg-background p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
