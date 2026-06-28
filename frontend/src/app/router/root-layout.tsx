import { Outlet } from 'react-router-dom'

export const RootLayout = () => {
    return (
        <div className="min-h-svh w-full">
            <Outlet />
        </div>
    )
}