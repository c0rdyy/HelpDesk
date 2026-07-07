import { AdminSectionHeader } from '@/features/admin/components/admin-section-header'
import { UsersSection } from '@/features/admin/components/users-section'
import { useAuthStore } from '@/stores/auth-store'

export function AdminUsersPage() {
  const user = useAuthStore((state) => state.user)

  if (!user) {
    return null
  }

  return (
    <>
      <AdminSectionHeader title="Пользователи" />
      <div className="px-4 py-4">
        <UsersSection currentUserId={user.id} />
      </div>
    </>
  )
}
