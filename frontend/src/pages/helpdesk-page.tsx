import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'

import { AuthModal } from '@/features/helpdesk/components/auth-modal'
import { CreateRequestModal } from '@/features/helpdesk/components/create-request-modal'
import { HelpDeskHeader } from '@/features/helpdesk/components/helpdesk-header'
import { RequestFilters } from '@/features/helpdesk/components/request-filters'
import { RequestListSection } from '@/features/helpdesk/components/request-list-section'
import { useHelpDeskRequests } from '@/features/helpdesk/hooks/use-helpdesk-requests'
import type {
  LoginFormState,
  RequestFormState
} from '@/features/helpdesk/types'
import { getApiErrorMessage } from '@/lib/utils'
import type { HelpDeskRequest } from '@/shared/api/types'
import { useAuthStore } from '@/stores/auth-store'

const initialRequestForm: RequestFormState = {
  title: '',
  description: '',
  priority: 'normal'
}

const initialLoginForm: LoginFormState = {
  username: '',
  password: ''
}

export function HelpDeskPage() {
  const bootstrap = useAuthStore((state) => state.bootstrap)
  const bootstrapped = useAuthStore((state) => state.bootstraped)
  const user = useAuthStore((state) => state.user)
  const login = useAuthStore((state) => state.login)
  const logout = useAuthStore((state) => state.logout)
  const fetchMe = useAuthStore((state) => state.fetchMe)
  const isAuthLoading = useAuthStore((state) => state.isAuthLoading)
  const authError = useAuthStore((state) => state.authError)
  const clearAuthError = useAuthStore((state) => state.clearAuthError)

  const titleInputRef = useRef<HTMLInputElement | null>(null)
  const loginInputRef = useRef<HTMLInputElement | null>(null)
  const [isCreateOpen, setCreateOpen] = useState(false)
  const [isAuthOpen, setAuthOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)
  const [requestForm, setRequestForm] =
    useState<RequestFormState>(initialRequestForm)
  const [loginForm, setLoginForm] = useState<LoginFormState>(initialLoginForm)
  const requests = useHelpDeskRequests()

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  useEffect(() => {
    if (isCreateOpen) {
      window.setTimeout(() => titleInputRef.current?.focus(), 0)
    }
  }, [isCreateOpen])

  useEffect(() => {
    if (isAuthOpen) {
      window.setTimeout(() => loginInputRef.current?.focus(), 0)
    }
  }, [isAuthOpen])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setCreateOpen(false)
        setAuthOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow

    if (isCreateOpen || isAuthOpen) {
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isAuthOpen, isCreateOpen])

  const isAdmin = Boolean(user?.is_admin)
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

  async function handleLoginSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearAuthError()

    try {
      await login(loginForm)
      await fetchMe()
      setLoginForm(initialLoginForm)
      setAuthOpen(false)
    } catch {
      // Error text is already stored in auth state.
    }
  }

  function handleLogout() {
    logout()
    setAuthOpen(false)
  }

  async function handleDelete(request: HelpDeskRequest) {
    const confirmed = window.confirm(`Удалить заявку "${request.title}"?`)

    if (!confirmed) {
      return
    }

    await requests.deleteRequest(request)
  }

  return (
    <div className="min-h-svh bg-[oklch(0.985_0.002_260)] px-4 py-5 text-foreground sm:py-8">
      <main className="mx-auto w-full max-w-4xl">
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <HelpDeskHeader
            onOpenAuth={() => setAuthOpen(true)}
            onSearchChange={requests.setSearchDraft}
            searchValue={requests.searchDraft}
            user={user}
          />

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

          <RequestListSection
            feedbackMessage={requests.feedbackMessage}
            isAdmin={isAdmin}
            isLoading={requests.isLoading}
            onDelete={handleDelete}
            onFeedbackDismiss={requests.clearFeedback}
            onOpenCreate={() => setCreateOpen(true)}
            onPageChange={requests.setPage}
            onReload={requests.reload}
            onStatusChange={requests.updateStatus}
            page={requests.page}
            pages={requests.pages}
            pendingRequestId={requests.pendingRequestId}
            requestState={requests.requestState}
          />
        </section>
      </main>

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

      <AuthModal
        authError={authError}
        bootstrapped={bootstrapped}
        inputRef={loginInputRef}
        isAuthLoading={isAuthLoading}
        loginForm={loginForm}
        onClose={() => setAuthOpen(false)}
        onFormChange={setLoginForm}
        onLogout={handleLogout}
        onSubmit={handleLoginSubmit}
        open={isAuthOpen}
        user={user}
      />
    </div>
  )
}
