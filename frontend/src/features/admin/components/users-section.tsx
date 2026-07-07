import { AlertCircle, Loader2 } from 'lucide-react'

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { PaginationControls } from '@/features/helpdesk/components/pagination-controls'
import { RequestsSkeleton } from '@/features/helpdesk/components/requests-skeleton'
import type { AdminUserInfo, UserRole } from '@/shared/api/types'

import { useAdminUsers } from '../hooks/use-admin-users'
import { UserRow } from './user-row'

interface UsersSectionProps {
  currentUserId: number
}

export function UsersSection({ currentUserId }: UsersSectionProps) {
  const {
    state,
    page,
    setPage,
    pages,
    isLoading,
    reload,
    pendingUserId,
    changeRole,
    toggleBlock
  } = useAdminUsers()

  const users = state.data
  const apiError = state.status === 'error' ? state.error : null

  function handleRoleChange(user: AdminUserInfo, role: UserRole) {
    if (role === user.role) {
      return
    }

    void changeRole(user, role)
  }

  function handleBlockToggle(user: AdminUserInfo) {
    void toggleBlock(user)
  }

  return (
    <div className="space-y-4">
      {isLoading && users ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Обновление
        </div>
      ) : null}

      {apiError ? (
        <Alert aria-live="polite" variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Ошибка API</AlertTitle>
          <AlertDescription>{apiError}</AlertDescription>
          <AlertAction>
            <Button onClick={reload} size="sm" type="button" variant="outline">
              Повторить
            </Button>
          </AlertAction>
        </Alert>
      ) : null}

      {isLoading && !users ? (
        <RequestsSkeleton />
      ) : users && users.items.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          {users.items.map((user) => (
            <UserRow
              isPending={pendingUserId === user.id}
              isSelf={user.id === currentUserId}
              key={user.id}
              onBlockToggle={handleBlockToggle}
              onRoleChange={handleRoleChange}
              user={user}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-4 text-center text-sm text-muted-foreground">
          Пользователи не найдены
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Показано {users?.items.length ?? 0} из {users?.total ?? 0}. Страница{' '}
          {users?.page ?? page} из {pages || 1}
        </p>

        <PaginationControls
          isLoading={isLoading}
          onPageChange={setPage}
          page={page}
          pages={pages}
        />
      </div>
    </div>
  )
}
