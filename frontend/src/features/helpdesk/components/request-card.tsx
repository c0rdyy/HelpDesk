import { Pencil, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import type { HelpDeskRequest, RequestStatus } from '@/shared/api/types'

import { priorityMeta } from '../constants'
import { formatDate } from '../lib/format-date'

interface RequestCardProps {
  isPending: boolean
  onDelete?: (request: HelpDeskRequest) => void
  onEdit?: (request: HelpDeskRequest) => void
  onStatusChange: (request: HelpDeskRequest, status: RequestStatus) => void
  request: HelpDeskRequest
  showCreator?: boolean
}

export function RequestCard({
  isPending,
  onDelete,
  onEdit,
  onStatusChange,
  request,
  showCreator = false
}: RequestCardProps) {
  const isDone = request.status === 'done'
  const hasActions = Boolean(onEdit) || Boolean(onDelete)
  const priorityBadge = (
    <Badge
      className={`h-6 px-2.5 ${priorityMeta[request.priority].className}`}
      variant="outline"
    >
      {priorityMeta[request.priority].label}
    </Badge>
  )

  return (
    <article className="relative flex min-h-36 flex-col justify-between rounded-lg border border-border bg-card p-4 transition-[border-color,box-shadow,transform] duration-200 ease-[var(--ease-out-quart)] hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-sm motion-reduce:transform-none motion-reduce:transition-none">
      {hasActions ? (
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1">
            {onEdit ? (
              <Button
                aria-label="Редактировать заявку"
                disabled={isPending || isDone}
                onClick={() => onEdit(request)}
                size="icon-sm"
                title={
                  isDone
                    ? 'Выполненную заявку нельзя редактировать'
                    : 'Редактировать заявку'
                }
                type="button"
                variant="ghost"
              >
                <Pencil />
              </Button>
            ) : null}
            {onDelete ? (
              <Button
                aria-label="удалить заявку"
                disabled={isPending || isDone}
                onClick={() => onDelete(request)}
                size="icon-sm"
                title={
                  isDone
                    ? 'Завершенную заявку нельзя удалить'
                    : 'удалить заявку'
                }
                type="button"
                variant="ghost"
              >
                <Trash2 />
              </Button>
            ) : null}
          </div>
          {priorityBadge}
        </div>
      ) : (
        <div className="absolute top-3 right-3">{priorityBadge}</div>
      )}

      <div className="space-y-3">
        <div className="space-y-1">
          <h3 className="min-w-0 pr-28 text-base font-semibold text-pretty">
            {request.title}
          </h3>
          {request.description ? (
            <p className="line-clamp-2 text-sm leading-5 text-muted-foreground">
              {request.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">Без описания</p>
          )}
          {showCreator ? (
            <p className="text-sm leading-5 text-muted-foreground">
              <span className="font-medium text-foreground/70">Автор:</span>{' '}
              {request.creator.username}
            </p>
          ) : null}
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
