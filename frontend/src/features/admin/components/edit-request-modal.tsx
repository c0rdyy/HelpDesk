import type { FormEventHandler } from 'react'
import { AlertCircle } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Modal } from '@/features/helpdesk/components/modal'
import type { RequestPriority } from '@/shared/api/types'

import type { RequestEditFormState } from '../types'

interface EditRequestModalProps {
  canSubmit: boolean
  error: string | null
  form: RequestEditFormState
  isSubmitting: boolean
  onClose: () => void
  onFormChange: (form: RequestEditFormState) => void
  onSubmit: FormEventHandler<HTMLFormElement>
  open: boolean
  requestTitle: string
}

export function EditRequestModal({
  canSubmit,
  error,
  form,
  isSubmitting,
  onClose,
  onFormChange,
  onSubmit,
  open,
  requestTitle
}: EditRequestModalProps) {
  const titleLength = form.title.trim().length
  const isTitleInvalid = titleLength > 0 && titleLength < 3

  return (
    <Modal
      description={requestTitle}
      onClose={onClose}
      open={open}
      title="Редактирование заявки"
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="edit-request-title">
            Заголовок
          </label>
          <Input
            aria-describedby="edit-request-title-help"
            aria-invalid={isTitleInvalid}
            id="edit-request-title"
            maxLength={120}
            onChange={(event) =>
              onFormChange({ ...form, title: event.target.value })
            }
            value={form.title}
          />
          <p
            className="flex justify-between gap-3 text-xs text-muted-foreground"
            id="edit-request-title-help"
          >
            <span>От 3 до 120 символов</span>
            <span>{titleLength}/120</span>
          </p>
        </div>

        <div className="space-y-1.5">
          <label
            className="text-sm font-medium"
            htmlFor="edit-request-description"
          >
            Описание
          </label>
          <Textarea
            id="edit-request-description"
            maxLength={1000}
            onChange={(event) =>
              onFormChange({ ...form, description: event.target.value })
            }
            value={form.description}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="edit-request-priority">
            Приоритет
          </label>
          <Select
            onValueChange={(value) =>
              onFormChange({ ...form, priority: value as RequestPriority })
            }
            value={form.priority}
          >
            <SelectTrigger
              aria-label="Приоритет заявки"
              className="w-full"
              id="edit-request-priority"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Низкий</SelectItem>
              <SelectItem value="normal">Обычный</SelectItem>
              <SelectItem value="high">Высокий</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {error ? (
          <Alert aria-live="polite" className="py-2" variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Button
          className="w-full"
          disabled={!canSubmit || isSubmitting}
          type="submit"
        >
          Сохранить
        </Button>
      </form>
    </Modal>
  )
}
