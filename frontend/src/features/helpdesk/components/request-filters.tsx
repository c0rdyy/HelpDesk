import { RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

import { sortLabels } from '../constants'
import type { FilterPriority, FilterStatus, SortValue } from '../types'

interface RequestFiltersProps {
  isLoading: boolean
  onPriorityChange: (value: FilterPriority) => void
  onReload: () => void
  onReset: () => void
  onSortChange: (value: SortValue) => void
  onStatusChange: (value: FilterStatus) => void
  priority: FilterPriority
  sort: SortValue
  status: FilterStatus
}

export function RequestFilters({
  isLoading,
  onPriorityChange,
  onReload,
  onReset,
  onSortChange,
  onStatusChange,
  priority,
  sort,
  status
}: RequestFiltersProps) {
  return (
    <div className="grid gap-3 border-b bg-muted/25 px-4 py-3 xl:grid-cols-[1fr_auto] xl:items-center">
      <div className="grid gap-2 sm:grid-cols-3">
        <Select
          onValueChange={(value) => onStatusChange(value as FilterStatus)}
          value={status}
        >
          <SelectTrigger aria-label="Фильтр по статусу" className="w-full">
            <SelectValue placeholder="Статус" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все статусы</SelectItem>
            <SelectItem value="new">Новые</SelectItem>
            <SelectItem value="in_progress">В работе</SelectItem>
            <SelectItem value="done">Выполнено</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => onPriorityChange(value as FilterPriority)}
          value={priority}
        >
          <SelectTrigger aria-label="Фильтр по приоритету" className="w-full">
            <SelectValue placeholder="Приоритет" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все приоритеты</SelectItem>
            <SelectItem value="low">Низкий</SelectItem>
            <SelectItem value="normal">Обычный</SelectItem>
            <SelectItem value="high">Высокий</SelectItem>
          </SelectContent>
        </Select>

        <Select
          onValueChange={(value) => onSortChange(value as SortValue)}
          value={sort}
        >
          <SelectTrigger aria-label="Сортировка заявок" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(sortLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button onClick={onReset} type="button" variant="outline">
          Сбросить
        </Button>
        <Button
          disabled={isLoading}
          onClick={onReload}
          size="icon"
          title="Обновить список"
          type="button"
          variant="outline"
        >
          <RefreshCw className={isLoading ? 'animate-spin' : undefined} />
        </Button>
      </div>
    </div>
  )
}
