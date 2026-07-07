import type { UserRole } from '@/shared/api/types'

type BadgeMeta = {
  label: string
  className: string
}

export const roleMeta = {
  admin: {
    label: 'Администратор',
    className: 'border-rose-200 bg-rose-50 text-rose-800'
  },
  user: {
    label: 'Пользователь',
    className: 'border-zinc-200 bg-zinc-50 text-zinc-700'
  }
} satisfies Record<UserRole, BadgeMeta>

export const USERS_PAGE_SIZE = 10

export const ADMIN_REQUESTS_PAGE_SIZE = 6
