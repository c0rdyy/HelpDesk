import type { FormEventHandler, Ref } from 'react'
import { AlertCircle, Plus } from 'lucide-react'

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
import type { RequestPriority } from '@/shared/api/types'

import type { RequestFormState } from '../types'
import { Modal } from './modal'

interface CreateRequestModalProps {
  canSubmit: boolean
  error: string | null
  form: RequestFormState
  inputRef: Ref<HTMLInputElement>
  onClose: () => void
  onFormChange: (form: RequestFormState) => void
  onSubmit: FormEventHandler<HTMLFormElement>
  open: boolean
}

export function CreateRequestModal({
  canSubmit,
  error,
  form,
  inputRef,
  onClose,
  onFormChange,
  onSubmit,
  open
}: CreateRequestModalProps) {
  const titleLength = form.title.trim().length
  const isTitleInvalid = titleLength > 0 && titleLength < 3

  return (
    <Modal onClose={onClose} open={open} title="Добавление заявки">
      <form className="space-y-4" onSubmit={onSubmit}>
        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="request-title">
            Заголовок
          </label>
          <Input
            aria-describedby="request-title-help"
            aria-invalid={isTitleInvalid}
            id="request-title"
            maxLength={120}
            onChange={(event) =>
              onFormChange({ ...form, title: event.target.value })
            }
            placeholder="Например, сломался принтер"
            ref={inputRef}
            value={form.title}
          />
          <p
            className="flex justify-between gap-3 text-xs text-muted-foreground"
            id="request-title-help"
          >
            <span>От 3 до 120 символов</span>
            <span>{titleLength}/120</span>
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="request-description">
            Описание
          </label>
          <Textarea
            id="request-description"
            maxLength={1000}
            onChange={(event) =>
              onFormChange({ ...form, description: event.target.value })
            }
            placeholder="Что произошло?"
            value={form.description}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-medium" htmlFor="request-priority">
            Приоритет
          </label>
          <Select
            onValueChange={(value) =>
              onFormChange({
                ...form,
                priority: value as RequestPriority
              })
            }
            value={form.priority}
          >
            <SelectTrigger
              aria-label="Приоритет новой заявки"
              className="w-full"
              id="request-priority"
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

        <Button className="w-full" disabled={!canSubmit} type="submit">
          <Plus data-icon="inline-start" />
          Создать
        </Button>
      </form>
    </Modal>
  )
}
