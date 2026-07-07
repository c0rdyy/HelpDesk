import { useState } from 'react'
import type { FormEvent } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'

import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { PaginationControls } from '@/features/helpdesk/components/pagination-controls'
import { RequestCard } from '@/features/helpdesk/components/request-card'
import { RequestFilters } from '@/features/helpdesk/components/request-filters'
import { RequestsSkeleton } from '@/features/helpdesk/components/requests-skeleton'
import { getApiErrorMessage } from '@/lib/utils'
import type { HelpDeskRequest } from '@/shared/api/types'

import type { useAdminRequests } from '../hooks/use-admin-requests'
import type { RequestEditFormState } from '../types'
import { EditRequestModal } from './edit-request-modal'

const emptyEditForm: RequestEditFormState = {
  title: '',
  description: '',
  priority: 'normal'
}

interface AdminRequestsSectionProps {
  requests: ReturnType<typeof useAdminRequests>
}

export function AdminRequestsSection({ requests }: AdminRequestsSectionProps) {
  const [editingRequest, setEditingRequest] = useState<HelpDeskRequest | null>(
    null
  )
  const [editForm, setEditForm] = useState<RequestEditFormState>(emptyEditForm)
  const [editError, setEditError] = useState<string | null>(null)
  const [isSubmittingEdit, setSubmittingEdit] = useState(false)

  const list = requests.requestState.data
  const apiError =
    requests.requestState.status === 'error'
      ? requests.requestState.error
      : null
  const total = list?.total ?? 0

  function handleEdit(request: HelpDeskRequest) {
    setEditingRequest(request)
    setEditForm({
      title: request.title,
      description: request.description ?? '',
      priority: request.priority
    })
    setEditError(null)
  }

  function handleCloseEdit() {
    setEditingRequest(null)
  }

  const editTitleLength = editForm.title.trim().length
  const canSubmitEdit =
    editTitleLength >= 3 && editTitleLength <= 120 && !isSubmittingEdit

  async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!editingRequest) {
      return
    }

    setEditError(null)
    setSubmittingEdit(true)

    try {
      await requests.updateRequest(editingRequest, {
        title: editForm.title.trim(),
        description: editForm.description.trim() || null,
        priority: editForm.priority
      })
      setEditingRequest(null)
    } catch (error) {
      setEditError(getApiErrorMessage(error, 'Не удалось обновить заявку'))
    } finally {
      setSubmittingEdit(false)
    }
  }

  function handleDelete(request: HelpDeskRequest) {
    const confirmed = window.confirm(`Удалить заявку "${request.title}"?`)

    if (!confirmed) {
      return
    }

    void requests.deleteRequest(request)
  }

  return (
    <div className="space-y-4">
      <RequestFilters
        isLoading={requests.isLoading}
        onPriorityChange={requests.setPriority}
        onReload={requests.reload}
        onReset={requests.resetFilters}
        onSortChange={requests.setSort}
        onStatusChange={requests.setStatus}
        priority={requests.priority}
        sort={requests.sort}
        status={requests.status}
      />

      {requests.isLoading && list ? (
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
            <Button
              onClick={requests.reload}
              size="sm"
              type="button"
              variant="outline"
            >
              Повторить
            </Button>
          </AlertAction>
        </Alert>
      ) : null}

      {requests.isLoading && !list ? (
        <RequestsSkeleton />
      ) : list && list.items.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.items.map((request) => (
            <RequestCard
              isPending={requests.pendingRequestId === request.id}
              key={request.id}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onStatusChange={requests.updateStatus}
              request={request}
              showCreator
            />
          ))}
        </div>
      ) : (
        <div className="flex min-h-32 items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-4 text-center text-sm text-muted-foreground">
          Заявки не найдены
        </div>
      )}

      <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Показано {list?.items.length ?? 0} из {total}. Страница{' '}
          {list?.page ?? requests.page} из {requests.pages || 1}
        </p>

        <PaginationControls
          isLoading={requests.isLoading}
          onPageChange={requests.setPage}
          page={requests.page}
          pages={requests.pages}
        />
      </div>

      <EditRequestModal
        canSubmit={canSubmitEdit}
        error={editError}
        form={editForm}
        isSubmitting={isSubmittingEdit}
        onClose={handleCloseEdit}
        onFormChange={setEditForm}
        onSubmit={handleEditSubmit}
        open={Boolean(editingRequest)}
        requestTitle={editingRequest?.title ?? ''}
      />
    </div>
  )
}
