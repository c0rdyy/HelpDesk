import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'

import { ToastViewport } from '@/components/toast-viewport'
import { useAuthStore } from '@/stores/auth-store'

export const RootLayout = () => {
  const bootstrap = useAuthStore((state) => state.bootstrap)

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  return (
    <div className="min-h-svh w-full">
      <Outlet />
      <ToastViewport />
    </div>
  )
}
