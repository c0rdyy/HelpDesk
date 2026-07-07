import { Loader2, ShieldCheck, ShieldOff } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { formatDate } from '@/features/helpdesk/lib/format-date'
import type { AdminUserInfo, UserRole } from '@/shared/api/types'

import { roleMeta } from '../constants'

interface UserRowProps {
  isPending: boolean
  isSelf: boolean
  onBlockToggle: (user: AdminUserInfo) => void
  onRoleChange: (user: AdminUserInfo, role: UserRole) => void
  user: AdminUserInfo
}

export function UserRow({
  isPending,
  isSelf,
  onBlockToggle,
  onRoleChange,
  user
}: UserRowProps) {
  const disabled = isPending || isSelf

  return (
    <div className="flex flex-col gap-2 border-b border-border px-3 py-2.5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{user.username}</span>
          <Badge
            className={`h-5 px-2 ${roleMeta[user.role].className}`}
            variant="outline"
          >
            {roleMeta[user.role].label}
          </Badge>
          {!user.is_active ? (
            <Badge className="h-5 px-2" variant="destructive">
              Заблокирован
            </Badge>
          ) : null}
          {isSelf ? (
            <Badge className="h-5 px-2" variant="secondary">
              Это вы
            </Badge>
          ) : null}
        </div>
        <p className="truncate text-sm leading-5 text-muted-foreground">{user.email}</p>
        <p className="text-xs leading-4 text-muted-foreground">
          Регистрация: {formatDate(user.created_at)}
          {user.last_login_at
            ? ` · Последний вход: ${formatDate(user.last_login_at)}`
            : ' · Ещё не заходил'}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {isPending ? <Loader2 className="size-4 animate-spin" /> : null}

        <Select
          disabled={disabled}
          onValueChange={(value) => onRoleChange(user, value as UserRole)}
          value={user.role}
        >
          <SelectTrigger
            aria-label={`Роль пользователя ${user.username}`}
            className="w-36"
            size="sm"
            title={
              isSelf
                ? 'Нельзя изменить собственную роль'
                : 'Изменить роль пользователя'
            }
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">Пользователь</SelectItem>
            <SelectItem value="admin">Администратор</SelectItem>
          </SelectContent>
        </Select>

        <Button
          aria-label={
            user.is_active
              ? `Заблокировать пользователя ${user.username}`
              : `Разблокировать пользователя ${user.username}`
          }
          disabled={disabled}
          onClick={() => onBlockToggle(user)}
          size="icon-sm"
          title={
            isSelf
              ? 'Нельзя заблокировать самого себя'
              : user.is_active
                ? 'Заблокировать пользователя'
                : 'Разблокировать пользователя'
          }
          type="button"
          variant="outline"
        >
          {user.is_active ? <ShieldOff /> : <ShieldCheck />}
        </Button>
      </div>
    </div>
  )
}
