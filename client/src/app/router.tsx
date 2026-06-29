import { createBrowserRouter } from 'react-router-dom'
import { LoginPage } from '@/features/auth'
import { ItemsPage } from '@/features/items'
import { ManagersPage } from '@/features/managers'
import { AgentsPage, AgentDetailPage } from '@/features/agents'
import { PatientsPage, PatientDetailPage } from '@/features/patients'
import { AppointmentsPage } from '@/features/appointments'
import { TasksPage } from '@/features/tasks'
import { FilesPage } from '@/features/files'
import { AnalyticsPage } from '@/features/analytics'
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
            path: '/agents',
            element: <AgentsPage />,
          },
          {
            path: '/agents/:id',
            element: <AgentDetailPage />,
          },
          {
            path: '/patients',
            element: <PatientsPage />,
          },
          {
            path: '/patients/:id',
            element: <PatientDetailPage />,
          },
          {
            path: '/appointments',
            element: <AppointmentsPage />,
          },
          {
            path: '/tasks',
            element: <TasksPage />,
          },
          {
            path: '/files',
            element: <FilesPage />,
          },
          {
            path: '/analytics',
            element: <AnalyticsPage />,
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
