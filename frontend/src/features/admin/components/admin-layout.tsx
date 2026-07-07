import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'

import { AppHeader } from '@/components/app-header'
import { ProfileModal } from '@/features/helpdesk/components/profile-modal'
import { useProfileEditor } from '@/features/helpdesk/hooks/use-profile-editor'
import type { UserInfo } from '@/shared/api/types'
import { useAuthStore } from '@/stores/auth-store'

function noop() {}

interface AdminLayoutProps {
  user: UserInfo
}

/**
 * Shared chrome for every /admin/* page. The guard guarantees that
 * only an authenticated admin can reach this layout.
 */
export function AdminLayout({ user }: AdminLayoutProps) {
  const logout = useAuthStore((state) => state.logout)
  const profile = useProfileEditor(user)

  useEffect(() => {
    const previousOverflow = document.body.style.overflow

    if (profile.isOpen) {
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [profile.isOpen])

  return (
    <div className="min-h-svh bg-[oklch(0.985_0.002_260)] text-foreground">
      <AppHeader
        onLogout={() => void logout()}
        onOpenAuth={noop}
        onOpenProfile={profile.openProfile}
        user={user}
      />

      <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:py-8">
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <Outlet />
        </section>
      </main>

      <ProfileModal
        error={profile.error}
        form={profile.form}
        isSubmitting={profile.isSubmitting}
        onClose={profile.closeProfile}
        onFormChange={profile.setForm}
        onSubmit={profile.handleSubmit}
        open={profile.isOpen}
      />
    </div>
  )
}
