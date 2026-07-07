import type { FormEvent } from 'react'
import { AlertCircle } from 'lucide-react'

import {
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import type { ProfileFormState } from '../types'
import { Modal } from './modal'

interface ProfileModalProps {
  error: string | null
  form: ProfileFormState
  isSubmitting: boolean
  onClose: () => void
  onFormChange: (form: ProfileFormState) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  open: boolean
}

export function ProfileModal({
  error,
  form,
  isSubmitting,
  onClose,
  onFormChange,
  onSubmit,
  open
}: ProfileModalProps) {
  return (
    <Modal onClose={onClose} open={open} title="Редактировать профиль">
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="grid gap-3">
          <label className="space-y-1.5 text-sm font-medium">
            <span>Логин</span>
            <Input
              autoComplete="username"
              maxLength={50}
              minLength={3}
              onChange={(event) =>
                onFormChange({ ...form, username: event.target.value })
              }
              placeholder="username"
              required
              value={form.username}
            />
          </label>

          <label className="space-y-1.5 text-sm font-medium">
            <span>ФИО</span>
            <Input
              autoComplete="name"
              maxLength={160}
              onChange={(event) =>
                onFormChange({ ...form, full_name: event.target.value })
              }
              placeholder="Иванов Иван Иванович"
              value={form.full_name}
            />
          </label>

          <label className="space-y-1.5 text-sm font-medium">
            <span>Email</span>
            <Input
              autoComplete="email"
              maxLength={50}
              onChange={(event) =>
                onFormChange({ ...form, email: event.target.value })
              }
              placeholder="user@example.com"
              required
              type="email"
              value={form.email}
            />
          </label>

          <label className="space-y-1.5 text-sm font-medium">
            <span>Телефон</span>
            <Input
              autoComplete="tel"
              maxLength={32}
              onChange={(event) =>
                onFormChange({ ...form, phone: event.target.value })
              }
              placeholder="+7 999 123-45-67"
              type="tel"
              value={form.phone}
            />
          </label>
        </div>

        {error ? (
          <Alert aria-live="polite" variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Не удалось сохранить</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button
            disabled={isSubmitting}
            onClick={onClose}
            type="button"
            variant="outline"
          >
            Отменить
          </Button>
          <Button disabled={isSubmitting} type="submit">
            Сохранить
          </Button>
        </div>
      </form>
    </Modal>
  )
}
