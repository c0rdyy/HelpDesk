import { useEffect, useRef, useState } from 'react'
import {
  ChevronDown,
  CircleUserRound,
  LogOut,
  Search,
  Settings,
  UserRound
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { UserInfo } from '@/shared/api/types'

interface AppHeaderProps {
  onOpenAuth: () => void
  onOpenProfile?: () => void
  onLogout?: () => void
  onSearchChange?: (value: string) => void
  searchValue?: string
  user: UserInfo | null
}

interface AccountMenuProps {
  onLogout?: () => void
  onOpenProfile?: () => void
  user: UserInfo
}

function AccountMenu({ onLogout, onOpenProfile, user }: AccountMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const displayName = user.full_name?.trim() || user.username

  useEffect(() => {
    if (!open) {
      return
    }

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false)
      }
    }

    window.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  function handleOpenProfile() {
    setOpen(false)
    onOpenProfile?.()
  }

  function handleLogout() {
    setOpen(false)
    onLogout?.()
  }

  return (
    <div className="relative" ref={menuRef}>
      <Button
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Меню профиля ${user.username}`}
        onClick={() => setOpen((value) => !value)}
        title={user.username}
        type="button"
        variant="outline"
      >
        <CircleUserRound data-icon="inline-start" />
        <span className="max-w-32 truncate">{user.username}</span>
        <ChevronDown
          className={
            open
              ? 'rotate-180 transition-transform duration-150'
              : 'transition-transform duration-150'
          }
          data-icon="inline-end"
        />
      </Button>

      {open ? (
        <div
          className="absolute top-full right-0 z-50 mt-2 w-72 rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-md ring-1 ring-foreground/5"
          role="menu"
        >
          <div className="flex items-center gap-3 rounded-md px-2.5 py-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
              <CircleUserRound className="size-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>

          <div className="my-1 border-t border-border" />

          <button
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors duration-150 hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
            onClick={handleOpenProfile}
            role="menuitem"
            type="button"
          >
            <UserRound className="size-4" />
            Профиль
          </button>

          <button
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-muted-foreground transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-60"
            disabled
            role="menuitem"
            title="Настройки пока не добавлены"
            type="button"
          >
            <Settings className="size-4" />
            Настройки
          </button>

          <div className="my-1 border-t border-border" />

          <button
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm text-destructive transition-colors duration-150 hover:bg-destructive/10 focus-visible:bg-destructive/10 focus-visible:outline-none"
            onClick={handleLogout}
            role="menuitem"
            type="button"
          >
            <LogOut className="size-4" />
            Выйти
          </button>
        </div>
      ) : null}
    </div>
  )
}

export function AppHeader({
  onOpenAuth,
  onOpenProfile,
  onLogout,
  onSearchChange,
  searchValue,
  user
}: AppHeaderProps) {
  const hasSearch = Boolean(onSearchChange)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card">
      <div
        className={
          hasSearch
            ? 'mx-auto grid w-full max-w-6xl gap-3 px-4 py-4 sm:grid-cols-[1fr_minmax(240px,380px)_1fr] sm:items-center'
            : 'mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4'
        }
      >
        <div>
          <Link className="text-xl font-bold" to="/">
            HelpDesk
          </Link>
        </div>

        {hasSearch ? (
          <div className="relative w-full sm:justify-self-center">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              aria-label="Поиск по заявкам"
              className="pl-8"
              onChange={(event) => onSearchChange?.(event.target.value)}
              placeholder="Поиск"
              value={searchValue}
            />
          </div>
        ) : null}

        <div className="flex items-center justify-self-start gap-2 sm:justify-self-end">
          {user?.is_admin ? (
            <Button asChild size="sm" title="Админ-панель" variant="outline">
              <Link aria-label="Админ-панель" to="/admin">
                Админ-панель
              </Link>
            </Button>
          ) : null}

          {user ? (
            <AccountMenu
              onLogout={onLogout}
              onOpenProfile={onOpenProfile}
              user={user}
            />
          ) : (
            <Button
              aria-label="Войти"
              onClick={onOpenAuth}
              size="icon"
              title="Войти"
              type="button"
              variant="outline"
            >
              <CircleUserRound />
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
