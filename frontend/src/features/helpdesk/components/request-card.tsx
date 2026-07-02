import { Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { HelpDeskRequest, RequestStatus } from '@/shared/api/types'

import { priorityMeta } from '../constants'
import { formatDate } from '../lib/format-date'

interface RequestCardProps {
  isAdmin: boolean
  isPending: boolean
  onDelete: (request: HelpDeskRequest) => void
  onStatusChange: (request: HelpDeskRequest, status: RequestStatus) => void
  request: HelpDeskRequest
}

export function RequestCard({
  isAdmin,
  isPending,
  onDelete,
  onStatusChange,
  request
}: RequestCardProps) {
  const isDone = request.status === 'done'

  return (
    <article className="relative flex min-h-36 flex-col justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:border-foreground/25">
      {isAdmin ? (
        <Button
          aria-label="Удалить заявку"
          className="absolute top-3 right-3"
          disabled={isPending || isDone}
          onClick={() => onDelete(request)}
          size="icon-sm"
          title={
            isDone ? 'Завершенную заявку нельзя удалить' : 'Удалить заявку'
          }
          type="button"
          variant="ghost"
        >
          <Trash2 />
        </Button>
      ) : null}

      <div className={cn('space-y-3', isAdmin && 'pr-9')}>
        <div className="space-y-1">
          <div className="flex flex-wrap items-start gap-2">
            <h3 className="min-w-0 flex-1 text-base font-semibold text-pretty">
              {request.title}
            </h3>
            <Badge
              className={`h-6 px-2.5 ${priorityMeta[request.priority].className}`}
              variant="outline"
            >
              {priorityMeta[request.priority].label}
            </Badge>
          </div>
          {request.description ? (
            <p className="line-clamp-2 text-sm leading-5 text-muted-foreground">
              {request.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Без описания</p>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {formatDate(request.created_at)}
        </div>

        <Select
          disabled={isPending || isDone}
          onValueChange={(value) =>
            onStatusChange(request, value as RequestStatus)
          }
          value={request.status}
        >
          <SelectTrigger
            aria-label={`Статус заявки ${request.title}`}
            className="w-full sm:w-36"
            size="sm"
            title={
              isDone ? 'Завершенную заявку нельзя изменить' : 'Изменить статус'
            }
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">Новая</SelectItem>
            <SelectItem value="in_progress">В работе</SelectItem>
            <SelectItem value="done">Выполнено</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </article>
  )
}
