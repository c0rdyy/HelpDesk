import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { ErrorBoundary } from './error-boundary'
import { appRouter } from './router'

export const AppRouterProvider = () => {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div>
            <h1>Загрузка...</h1>
          </div>
        }
      >
        <RouterProvider router={appRouter} />
      </Suspense>
    </ErrorBoundary>
  )
}
