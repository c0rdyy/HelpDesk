import { createBrowserRouter } from 'react-router-dom'
import { AdminGuard } from './router/admin-guard'
import { RootLayout } from './router/root-layout'
import { RootRedirect } from './router/root-redirect'
import { RouteErrorPage } from './router/route-error-page'
import { AdminDashboardPage } from '@/pages/admin-dashboard-page'
import { AdminRequestsPage } from '@/pages/admin-requests-page'
import { AdminUsersPage } from '@/pages/admin-users-page'

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      { index: true, element: <RootRedirect /> },
      {
        path: 'admin',
        element: <AdminGuard />,
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'users', element: <AdminUsersPage /> },
          { path: 'requests', element: <AdminRequestsPage /> }
        ]
      }
    ]
  }
])
