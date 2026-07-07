import { DashboardCard } from '@/features/admin/components/dashboard-card'
import { useDashboardCounts } from '@/features/admin/hooks/use-dashboard-counts'

export function AdminDashboardPage() {
  const { userCount, requestCount, isLoading } = useDashboardCounts()

  return (
    <div className="space-y-4 px-4 py-4">
      <h1 className="text-xl font-bold">Админ-панель</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard
          count={userCount}
          description="Роли, блокировки, список аккаунтов"
          isLoadingCount={isLoading}
          title="Пользователи"
          to="/admin/users"
        />
        <DashboardCard
          count={requestCount}
          description="Просмотр, редактирование, фильтр по создателю"
          isLoadingCount={isLoading}
          title="Заявки"
          to="/admin/requests"
        />
        <DashboardCard
          description="Аналитика по заявкам и пользователям"
          disabled
          title="Статистика"
        />
      </div>
    </div>
  )
}
