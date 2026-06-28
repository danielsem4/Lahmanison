import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from '@/features/auth'
import { ItemsPage } from '@/features/items'
import { ManagersPage } from '@/features/managers'
import { RoleHome } from '@/features/home/RoleHome'
import { SettingsPage } from '@/features/settings'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { GuestRoute } from '@/components/shared/GuestRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { NotFoundPage } from '@/components/shared/NotFoundPage'

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      {
        path: '/login',
        element: <LoginPage />,
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <RoleHome />,
          },
          {
            path: '/managers',
            element: <ManagersPage />,
          },
          {
            path: '/items',
            element: <ItemsPage />,
          },
          {
            path: '/settings',
            element: <SettingsPage />,
          },
          {
            path: '*',
            element: <NotFoundPage />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
