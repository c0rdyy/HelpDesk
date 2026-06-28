import { Suspense } from 'react'
import { RouterProvider } from 'react-router-dom'
import { appRouter } from './router'

export const AppRouterProvider = () => {
    return (
        <Suspense 
            fallback={
                <div>
                    <h1>Загрузка...</h1>
                </div>
            }
        >
            <RouterProvider router={ appRouter }/>
        </Suspense>
    )
}