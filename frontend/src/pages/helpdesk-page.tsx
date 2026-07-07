import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'

import { AppHeader } from '@/components/app-header'
import { AuthModal } from '@/features/helpdesk/components/auth-modal'
import { CreateRequestModal } from '@/features/helpdesk/components/create-request-modal'
import { ProfileModal } from '@/features/helpdesk/components/profile-modal'
import { RequestFilters } from '@/features/helpdesk/components/request-filters'
import { RequestListSection } from '@/features/helpdesk/components/request-list-section'
import { useHelpDeskRequests } from '@/features/helpdesk/hooks/use-helpdesk-requests'
import { useProfileEditor } from '@/features/helpdesk/hooks/use-profile-editor'
import type {
  LoginFormState,
  RegisterFormState,
  RequestFormState
} from '@/features/helpdesk/types'
import { getApiErrorMessage } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'

const initialRequestForm: RequestFormState = {
  title: '',
  description: '',
  priority: 'normal'
}

const initialLoginForm: LoginFormState = {
  username: '',
  password: '',
  remember_me: false
}

const initialRegisterForm: RegisterFormState = {
  username: '',
  email: '',
  password: '',
  confirm_password: ''
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateUsername(username: string): string | null {
  const trimmedUsername = username.trim()

  if (!trimmedUsername) {
    return 'Поле «Логин» нужно заполнить'
  }

  if (trimmedUsername.length < 3) {
    return 'Поле «Логин» должно быть не короче 3 символа'
  }

  if (trimmedUsername.length > 50) {
    return 'Поле «Логин» должно быть не длиннее 50 символов'
  }

  return null
}

function validatePassword(password: string): string | null {
  if (!password) {
    return 'Поле «Пароль» нужно заполнить'
  }

  if (password.length > 50) {
    return 'Поле «Пароль» должно быть не длиннее 50 символов'
  }

  return null
}

function validateLoginForm(form: LoginFormState): string | null {
  return validateUsername(form.username) ?? validatePassword(form.password)
}

function validateRegisterForm(form: RegisterFormState): string | null {
  const usernameError = validateUsername(form.username)

  if (usernameError) {
    return usernameError
  }

  const email = form.email.trim()

  if (!email) {
    return 'Поле «Email» нужно заполнить'
  }

  if (email.length < 3) {
    return 'Поле «Email» должно быть не короче 3 символа'
  }

  if (email.length > 50) {
    return 'Поле «Email» должно быть не длиннее 50 символов'
  }

  if (!EMAIL_PATTERN.test(email)) {
    return 'Поле «Email» должно быть корректным email-адресом'
  }

  const passwordError = validatePassword(form.password)

  if (passwordError) {
    return passwordError
  }

  if (!form.confirm_password) {
    return 'Поле «Повторите пароль» нужно заполнить'
  }

  if (form.confirm_password.length > 50) {
    return 'Поле «Повторите пароль» должно быть не длиннее 50 символов'
  }

  if (form.password !== form.confirm_password) {
    return 'Пароли не совпадают'
  }

  return null
}

export function HelpDeskPage() {
  const bootstrap = useAuthStore((state) => state.bootstrap)
  const bootstrapped = useAuthStore((state) => state.bootstraped)
  const user = useAuthStore((state) => state.user)
  const login = useAuthStore((state) => state.login)
  const register = useAuthStore((state) => state.register)
  const logout = useAuthStore((state) => state.logout)
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
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [loginForm, setLoginForm] = useState<LoginFormState>(initialLoginForm)
  const [registerForm, setRegisterForm] =
    useState<RegisterFormState>(initialRegisterForm)
  const [authFormError, setAuthFormError] = useState<string | null>(null)
  const authModalOpen = isAuthOpen || !user
  const canCloseAuth = Boolean(user)
  const requests = useHelpDeskRequests({ enabled: Boolean(user) })
  const profile = useProfileEditor(user)

  useEffect(() => {
    void bootstrap()
  }, [bootstrap])

  useEffect(() => {
    if (isCreateOpen) {
      window.setTimeout(() => titleInputRef.current?.focus(), 0)
    }
  }, [isCreateOpen])

  useEffect(() => {
    if (authModalOpen) {
      window.setTimeout(() => loginInputRef.current?.focus(), 0)
    }
  }, [authModalOpen])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setCreateOpen(false)

        if (canCloseAuth) {
          setAuthOpen(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canCloseAuth])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow

    if (isCreateOpen || authModalOpen || profile.isOpen) {
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [authModalOpen, isCreateOpen, profile.isOpen])

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
    setAuthFormError(null)

    const validationError = validateLoginForm(loginForm)

    if (validationError) {
      setAuthFormError(validationError)
      return
    }

    try {
      await login({
        ...loginForm,
        username: loginForm.username.trim()
      })
      setLoginForm(initialLoginForm)
      setAuthOpen(false)
    } catch {
      // Error text is already stored in auth state.
    }
  }

  async function handleRegisterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    clearAuthError()
    setAuthFormError(null)

    const validationError = validateRegisterForm(registerForm)

    if (validationError) {
      setAuthFormError(validationError)
      return
    }

    try {
      await register({
        ...registerForm,
        email: registerForm.email.trim(),
        username: registerForm.username.trim()
      })
      setRegisterForm(initialRegisterForm)
      setAuthMode('login')
      setAuthOpen(false)
    } catch {
      // Error text is already stored in auth state.
    }
  }

  async function handleLogout() {
    profile.closeProfile()
    await logout()
    setAuthOpen(true)
  }

  function handleCloseAuth() {
    if (canCloseAuth) {
      setAuthOpen(false)
    }
  }

  return (
    <div className="min-h-svh bg-[oklch(0.985_0.002_260)] text-foreground">
      <AppHeader
        onLogout={() => void handleLogout()}
        onOpenAuth={() => setAuthOpen(true)}
        onOpenProfile={profile.openProfile}
        onSearchChange={requests.setSearchDraft}
        searchValue={requests.searchDraft}
        user={user}
      />

      <main className="mx-auto w-full max-w-6xl px-4 py-5 sm:py-8">
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <RequestListSection
            filters={
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
            }
            isLoading={requests.isLoading}
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

      <ProfileModal
        error={profile.error}
        form={profile.form}
        isSubmitting={profile.isSubmitting}
        onClose={profile.closeProfile}
        onFormChange={profile.setForm}
        onSubmit={profile.handleSubmit}
        open={profile.isOpen}
      />

      <AuthModal
        authError={authFormError ?? authError}
        authMode={authMode}
        bootstrapped={bootstrapped}
        canClose={canCloseAuth}
        inputRef={loginInputRef}
        isAuthLoading={isAuthLoading}
        loginForm={loginForm}
        registerForm={registerForm}
        onClose={handleCloseAuth}
        onLoginFormChange={(form) => {
          setAuthFormError(null)
          setLoginForm(form)
        }}
        onLogout={handleLogout}
        onModeChange={(mode) => {
          clearAuthError()
          setAuthFormError(null)
          setAuthMode(mode)
        }}
        onRegisterFormChange={(form) => {
          setAuthFormError(null)
          setRegisterForm(form)
        }}
        onLoginSubmit={handleLoginSubmit}
        onRegisterSubmit={handleRegisterSubmit}
        open={authModalOpen}
        user={user}
      />
    </div>
  )
}
