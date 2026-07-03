import { createBrowserRouter } from 'react-router-dom'
import { RootLayout } from './router/root-layout'
import { RootRedirect } from './router/root-redirect'
import { RouteErrorPage } from './router/route-error-page'

export const appRouter = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [{ index: true, element: <RootRedirect /> }]
  }
])
