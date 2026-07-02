import type { FormEventHandler, Ref } from 'react'
import {
  AlertCircle,
  CircleUserRound,
  Loader2,
  LogIn,
  LogOut
} from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { UserInfo } from '@/shared/api/types'

import type { LoginFormState } from '../types'
import { Modal } from './modal'

interface AuthModalProps {
  authError: string | null
  bootstrapped: boolean
  inputRef: Ref<HTMLInputElement>
  isAuthLoading: boolean
  loginForm: LoginFormState
  onClose: () => void
  onFormChange: (form: LoginFormState) => void
  onLogout: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  open: boolean
  user: UserInfo | null
}

export function AuthModal({
  authError,
  bootstrapped,
  inputRef,
  isAuthLoading,
  loginForm,
  onClose,
  onFormChange,
  onLogout,
  onSubmit,
  open,
  user
}: AuthModalProps) {
  return (
    <Modal
      description={
        user ? 'Сессия активна.' : 'Вход только для администраторов.'
      }
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
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-1.5">
            <label className="text-sm font-medium" htmlFor="login-username">
              Логин
            </label>
            <Input
              autoComplete="username"
              id="login-username"
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
              onChange={(event) =>
                onFormChange({ ...loginForm, password: event.target.value })
              }
              type="password"
              value={loginForm.password}
            />
          </div>

          {authError ? (
            <Alert aria-live="polite" className="py-2" variant="destructive">
              <AlertCircle className="size-4" />
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          ) : null}

          <Button
            className="w-full"
            disabled={
              isAuthLoading || !loginForm.username || !loginForm.password
            }
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
      )}
    </Modal>
  )
}
