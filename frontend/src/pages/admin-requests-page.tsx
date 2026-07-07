import { useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AdminRequestsSection } from '@/features/admin/components/admin-requests-section'
import { AdminSectionHeader } from '@/features/admin/components/admin-section-header'
import { useAdminRequests } from '@/features/admin/hooks/use-admin-requests'
import { CreateRequestModal } from '@/features/helpdesk/components/create-request-modal'
import type { RequestFormState } from '@/features/helpdesk/types'
import { getApiErrorMessage } from '@/lib/utils'

const initialRequestForm: RequestFormState = {
  title: '',
  description: '',
  priority: 'normal'
}

export function AdminRequestsPage() {
  const requests = useAdminRequests()

  const titleInputRef = useRef<HTMLInputElement | null>(null)
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [requestForm, setRequestForm] =
    useState<RequestFormState>(initialRequestForm)

  const canCreate =
    requestForm.title.trim().length >= 3 &&
    requestForm.title.trim().length <= 120

  async function handleCreateSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCreateError(null)

    const title = requestForm.title.trim()
    const description = requestForm.description.trim()

    if (title.length < 3) {
      setCreateError('Заголовок должен быть не короче 3 символов')
      return
    }

    try {
      await requests.createRequest({
        title,
        description: description || null,
        priority: requestForm.priority
      })

      setRequestForm(initialRequestForm)
      setCreateOpen(false)
    } catch (error) {
      setCreateError(getApiErrorMessage(error, 'Не удалось создать заявку'))
    }
  }

  return (
    <>
      <AdminSectionHeader
        action={
          <Button
            aria-label="Добавить заявку"
            onClick={() => setCreateOpen(true)}
            size="icon-sm"
            title="Добавить заявку"
            type="button"
            variant="outline"
          >
            <Plus />
          </Button>
        }
        title="Заявки"
      />
      <div className="px-4 py-4">
        <AdminRequestsSection requests={requests} />
      </div>

      <CreateRequestModal
        canSubmit={canCreate}
        error={createError}
        form={requestForm}
        inputRef={titleInputRef}
        onClose={() => setCreateOpen(false)}
        onFormChange={setRequestForm}
        onSubmit={handleCreateSubmit}
        open={isCreateOpen}
      />
    </>
  )
}
