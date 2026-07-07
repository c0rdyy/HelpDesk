import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Loader2, Plus } from 'lucide-react'

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import type { HelpDeskRequest, RequestStatus } from '@/shared/api/types'

import type { RequestListState } from '../types'
import { PaginationControls } from './pagination-controls'
import { RequestCard } from './request-card'
import { RequestsSkeleton } from './requests-skeleton'

interface RequestListSectionProps {
  filters?: ReactNode
  isLoading: boolean
  onOpenCreate: () => void
  onPageChange: (page: number) => void
  onReload: () => void
  onStatusChange: (request: HelpDeskRequest, status: RequestStatus) => void
  page: number
  pages: number
  pendingRequestId: number | null
  requestState: RequestListState
}

export function RequestListSection({
  filters,
  isLoading,
  onOpenCreate,
  onPageChange,
  onReload,
  onStatusChange,
  page,
  pages,
  pendingRequestId,
  requestState
}: RequestListSectionProps) {
  const requests = requestState.data
  const apiError = requestState.status === 'error' ? requestState.error : null
  const total = requests?.total ?? 0

  return (
    <div className="px-4 py-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold">Заявки</h2>
        <div className="flex items-center gap-2">
          <Button
            aria-label="Добавить заявку"
            onClick={onOpenCreate}
            size="icon-sm"
            title="Добавить заявку"
            type="button"
            variant="outline"
          >
            <Plus />
          </Button>
        </div>

        {isLoading && requests ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Обновление
          </div>
        ) : null}
      </div>

      {filters ? <div className="mb-4">{filters}</div> : null}

      {apiError ? (
        <Alert aria-live="polite" className="mb-4" variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Ошибка API</AlertTitle>
          <AlertDescription>
            {apiError}. Проверьте, что backend запущен, или повторите запрос.
          </AlertDescription>
          <AlertAction>
            <Button
              onClick={onReload}
              size="sm"
              type="button"
              variant="outline"
            >
              Повторить
            </Button>
          </AlertAction>
        </Alert>
      ) : null}

      {isLoading && !requests ? (
        <RequestsSkeleton />
      ) : requests && requests.items.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {requests.items.map((request) => (
            <RequestCard
              isPending={pendingRequestId === request.id}
              key={request.id}
              onStatusChange={onStatusChange}
              request={request}
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-64 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-4 text-center">
          <div className="max-w-sm space-y-3">
            <CheckCircle2 className="mx-auto size-8 text-muted-foreground" />
            <div>
              <h3 className="font-medium">Список пуст</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Измените фильтры или создайте первую заявку.
              </p>
            </div>
            <Button onClick={onOpenCreate} type="button" variant="outline">
              <Plus data-icon="inline-start" />
              Добавить
            </Button>
          </div>
        </div>
      )}

      <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Показано {requests?.items.length ?? 0} из {total}. Страница{' '}
          {requests?.page ?? page} из {pages || 1}
        </p>

        <PaginationControls
          isLoading={isLoading}
          onPageChange={onPageChange}
          page={page}
          pages={pages}
        />
      </div>
    </div>
  )
}
