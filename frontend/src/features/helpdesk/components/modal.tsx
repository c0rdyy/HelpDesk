import type { ReactNode } from 'react'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface ModalProps {
  children: ReactNode
  description?: string
  onClose: () => void
  open: boolean
  title: string
}

export function Modal({
  children,
  description,
  onClose,
  open,
  title
}: ModalProps) {
  if (!open) {
    return null
  }

  return (
    <div
      aria-label={title}
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 px-4 py-6"
      onMouseDown={onClose}
      role="dialog"
    >
      <div
        className="max-h-[min(720px,calc(100svh-48px))] 
        w-full max-w-md overflow-y-auto rounded-xl border border-border 
        bg-card text-card-foreground shadow-lg"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <Button
            aria-label="Закрыть"
            onClick={onClose}
            size="icon-sm"
            type="button"
            variant="ghost"
          >
            <X />
          </Button>
        </div>

        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  )
}
