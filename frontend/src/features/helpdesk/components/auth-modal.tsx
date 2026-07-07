import type { FormEventHandler, Ref } from 'react'
import {
  AlertCircle,
  CircleUserRound,
  Loader2,
  LogIn,
  LogOut,
  UserPlus
} from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { UserInfo } from '@/shared/api/types'

import type { LoginFormState, RegisterFormState } from '../types'
import { Modal } from './modal'

type AuthMode = 'login' | 'register'

interface AuthModalProps {
  authError: string | null
  authMode: AuthMode
  bootstrapped: boolean
  canClose: boolean
  inputRef: Ref<HTMLInputElement>
  isAuthLoading: boolean
  loginForm: LoginFormState
  registerForm: RegisterFormState
  onClose: () => void
  onLoginFormChange: (form: LoginFormState) => void
  onLogout: () => void
  onModeChange: (mode: AuthMode) => void
  onRegisterFormChange: (form: RegisterFormState) => void
  onLoginSubmit: FormEventHandler<HTMLFormElement>
  onRegisterSubmit: FormEventHandler<HTMLFormElement>
  open: boolean
  user: UserInfo | null
}

export function AuthModal({
  authError,
  authMode,
  bootstrapped,
  canClose,
  inputRef,
  isAuthLoading,
  loginForm,
  registerForm,
  onClose,
  onLoginFormChange,
  onLogout,
  onModeChange,
  onRegisterFormChange,
  onLoginSubmit,
  onRegisterSubmit,
  open,
  user
}: AuthModalProps) {
  const isLoginMode = authMode === 'login'

  return (
    <Modal
      canClose={canClose}
      headerAlign="center"
      onClose={onClose}
      open={open}
      title="Авторизация"
    >
      {!bootstrapped ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Проверка сессии
        </div>
      ) : user ? (
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/25 p-3">
            <div className="flex items-center gap-2 font-medium">
              <CircleUserRound className="size-4" />
              {user.username}
            </div>
          </div>
          <Button
            className="w-full"
            onClick={onLogout}
            type="button"
            variant="outline"
          >
            <LogOut data-icon="inline-start" />
            Выйти
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-1 rounded-md bg-muted p-1">
            <Button
              aria-pressed={isLoginMode}
              onClick={() => onModeChange('login')}
              size="sm"
              type="button"
              variant={isLoginMode ? 'secondary' : 'ghost'}
            >
              Вход
            </Button>
            <Button
              aria-pressed={!isLoginMode}
              onClick={() => onModeChange('register')}
              size="sm"
              type="button"
              variant={!isLoginMode ? 'secondary' : 'ghost'}
            >
              Регистрация
            </Button>
          </div>

          {isLoginMode ? (
            <div key="login" className="motion-auth-panel">
              <LoginForm
                authError={authError}
                inputRef={inputRef}
                isAuthLoading={isAuthLoading}
                loginForm={loginForm}
                onFormChange={onLoginFormChange}
                onSubmit={onLoginSubmit}
              />
            </div>
          ) : (
            <div key="register" className="motion-auth-panel">
              <RegisterForm
                authError={authError}
                inputRef={inputRef}
                isAuthLoading={isAuthLoading}
                onFormChange={onRegisterFormChange}
                onSubmit={onRegisterSubmit}
                registerForm={registerForm}
              />
            </div>
          )}
        </div>
      )}
    </Modal>
  )
}

interface LoginFormProps {
  authError: string | null
  inputRef: Ref<HTMLInputElement>
  isAuthLoading: boolean
  loginForm: LoginFormState
  onFormChange: (form: LoginFormState) => void
  onSubmit: FormEventHandler<HTMLFormElement>
}

function LoginForm({
  authError,
  inputRef,
  isAuthLoading,
  loginForm,
  onFormChange,
  onSubmit
}: LoginFormProps) {
  return (
    <form className="space-y-4" noValidate onSubmit={onSubmit}>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="login-username">
          Логин
        </label>
        <Input
          autoComplete="username"
          id="login-username"
          maxLength={50}
          onChange={(event) =>
            onFormChange({ ...loginForm, username: event.target.value })
          }
          ref={inputRef}
          value={loginForm.username}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="login-password">
          Пароль
        </label>
        <Input
          autoComplete="current-password"
          id="login-password"
          maxLength={50}
          onChange={(event) =>
            onFormChange({ ...loginForm, password: event.target.value })
          }
          type="password"
          value={loginForm.password}
        />
      </div>

      <label
        className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground"
        htmlFor="login-remember"
      >
        <input
          checked={loginForm.remember_me}
          className="size-4 rounded border-border accent-primary"
          id="login-remember"
          onChange={(event) =>
            onFormChange({
              ...loginForm,
              remember_me: event.target.checked
            })
          }
          type="checkbox"
        />
        Запомнить меня
      </label>

      {authError ? (
        <Alert
          aria-live="polite"
          className="motion-alert py-2"
          variant="destructive"
        >
          <AlertCircle className="size-4" />
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      ) : null}

      <Button
        className="w-full"
        disabled={isAuthLoading || !loginForm.username || !loginForm.password}
        type="submit"
      >
        {isAuthLoading ? (
          <Loader2 className="animate-spin" data-icon="inline-start" />
        ) : (
          <LogIn data-icon="inline-start" />
        )}
        Войти
      </Button>
    </form>
  )
}

interface RegisterFormProps {
  authError: string | null
  inputRef: Ref<HTMLInputElement>
  isAuthLoading: boolean
  registerForm: RegisterFormState
  onFormChange: (form: RegisterFormState) => void
  onSubmit: FormEventHandler<HTMLFormElement>
}

function RegisterForm({
  authError,
  inputRef,
  isAuthLoading,
  registerForm,
  onFormChange,
  onSubmit
}: RegisterFormProps) {
  const passwordsMatch =
    registerForm.password === registerForm.confirm_password ||
    !registerForm.confirm_password

  return (
    <form className="space-y-4" noValidate onSubmit={onSubmit}>
      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="register-username">
          Логин
        </label>
        <Input
          autoComplete="username"
          id="register-username"
          maxLength={50}
          onChange={(event) =>
            onFormChange({ ...registerForm, username: event.target.value })
          }
          ref={inputRef}
          value={registerForm.username}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="register-email">
          Email
        </label>
        <Input
          autoComplete="email"
          id="register-email"
          maxLength={50}
          onChange={(event) =>
            onFormChange({ ...registerForm, email: event.target.value })
          }
          type="email"
          value={registerForm.email}
        />
      </div>

      <div className="space-y-1.5">
        <label className="text-sm font-medium" htmlFor="register-password">
          Пароль
        </label>
        <Input
          autoComplete="new-password"
          id="register-password"
          maxLength={50}
          onChange={(event) =>
            onFormChange({ ...registerForm, password: event.target.value })
          }
          type="password"
          value={registerForm.password}
        />
      </div>

      <div className="space-y-1.5">
        <label
          className="text-sm font-medium"
          htmlFor="register-confirm-password"
        >
          Повторите пароль
        </label>
        <Input
          aria-invalid={!passwordsMatch}
          autoComplete="new-password"
          id="register-confirm-password"
          maxLength={50}
          onChange={(event) =>
            onFormChange({
              ...registerForm,
              confirm_password: event.target.value
            })
          }
          type="password"
          value={registerForm.confirm_password}
        />
      </div>

      {!passwordsMatch ? (
        <Alert
          aria-live="polite"
          className="motion-alert py-2"
          variant="destructive"
        >
          <AlertCircle className="size-4" />
          <AlertDescription>Пароли не совпадают</AlertDescription>
        </Alert>
      ) : authError ? (
        <Alert
          aria-live="polite"
          className="motion-alert py-2"
          variant="destructive"
        >
          <AlertCircle className="size-4" />
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
      ) : null}

      <Button
        className="w-full"
        disabled={
          isAuthLoading ||
          !registerForm.username ||
          !registerForm.email ||
          !registerForm.password ||
          !registerForm.confirm_password ||
          !passwordsMatch
        }
        type="submit"
      >
        {isAuthLoading ? (
          <Loader2 className="animate-spin" data-icon="inline-start" />
        ) : (
          <UserPlus data-icon="inline-start" />
        )}
        Зарегистрироваться
      </Button>
    </form>
  )
}
