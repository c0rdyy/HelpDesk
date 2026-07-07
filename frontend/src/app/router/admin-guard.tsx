import { Loader2 } from 'lucide-react'
import { Navigate } from 'react-router-dom'

import { AdminLayout } from '@/features/admin/components/admin-layout'
import { useAuthStore } from '@/stores/auth-store'

export function AdminGuard() {
  const bootstrapped = useAuthStore((state) => state.bootstraped)
  const user = useAuthStore((state) => state.user)

  if (!bootstrapped) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user?.is_admin) {
    return <Navigate replace to="/" />
  }

  return <AdminLayout user={user} />
}
