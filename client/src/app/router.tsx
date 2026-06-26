import { createBrowserRouter, Navigate } from 'react-router-dom'
import { LoginPage } from '@/features/auth'
import { ItemsPage } from '@/features/items'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { GuestRoute } from '@/components/shared/GuestRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { NotFoundPage } from '@/components/shared/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/items" replace />,
  },
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
            path: '/items',
            element: <ItemsPage />,
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
