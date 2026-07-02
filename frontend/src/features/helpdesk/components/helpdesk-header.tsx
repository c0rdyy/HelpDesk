import { CircleUserRound, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { UserInfo } from '@/shared/api/types'

interface HelpDeskHeaderProps {
  onOpenAuth: () => void
  onSearchChange: (value: string) => void
  searchValue: string
  user: UserInfo | null
}

export function HelpDeskHeader({
  onOpenAuth,
  onSearchChange,
  searchValue,
  user
}: HelpDeskHeaderProps) {
  return (
    <header className="grid gap-3 border-b px-4 py-4 sm:grid-cols-[1fr_minmax(240px,380px)_1fr] sm:items-center">
      <div>
        <h1 className="text-xl font-bold">HelpDesk</h1>
      </div>

      <div className="relative w-full sm:justify-self-center">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Поиск по заявкам"
          className="pl-8"
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Поиск"
          value={searchValue}
        />
      </div>

      <div className="justify-self-start sm:justify-self-end">
        <Button
          aria-label={user ? `Профиль ${user.username}` : 'Войти админом'}
          onClick={onOpenAuth}
          size={user ? 'default' : 'icon'}
          title={user ? user.username : 'Войти админом'}
          type="button"
          variant="outline"
        >
          <CircleUserRound data-icon={user ? 'inline-start' : undefined} />
          {user ? user.username : null}
        </Button>
      </div>
    </header>
  )
}
