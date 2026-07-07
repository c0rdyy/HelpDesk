import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ModalProps {
  canClose?: boolean
  children: ReactNode
  description?: string
  headerAlign?: 'start' | 'center'
  onClose: () => void
  open: boolean
  title: string
}

const MODAL_EXIT_MS = 160

export function Modal({
  canClose = true,
  children,
  description,
  headerAlign = 'start',
  onClose,
  open,
  title
}: ModalProps) {
  const [mounted, setMounted] = useState(open)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let mountFrameId = 0
    let visibleFrameId = 0
    let timeoutId = 0

    if (open) {
      mountFrameId = window.requestAnimationFrame(() => {
        setMounted(true)

        visibleFrameId = window.requestAnimationFrame(() => setVisible(true))
      })

      return () => {
        window.cancelAnimationFrame(mountFrameId)
        window.cancelAnimationFrame(visibleFrameId)
      }
    }

    visibleFrameId = window.requestAnimationFrame(() => setVisible(false))
    timeoutId = window.setTimeout(() => setMounted(false), MODAL_EXIT_MS)

    return () => {
      window.cancelAnimationFrame(visibleFrameId)
      window.clearTimeout(timeoutId)
    }
  }, [open])

  if (!mounted) {
    return null
  }

  function handleClose() {
    if (canClose) {
      onClose()
    }
  }

  return (
    <div
      aria-label={title}
      aria-modal="true"
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-foreground/35 px-4 py-6',
        'transition-[opacity,backdrop-filter] duration-200 ease-[var(--ease-out-quart)] motion-reduce:transition-none',
        visible ? 'opacity-100 backdrop-blur-[2px]' : 'opacity-0 backdrop-blur-none'
      )}
      onMouseDown={handleClose}
      role="dialog"
    >
      <div
        className={cn(
          'max-h-[min(720px,calc(100svh-48px))] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-card text-card-foreground shadow-lg',
          'transition-[opacity,transform] duration-[260ms] ease-[var(--ease-out-quint)] will-change-transform motion-reduce:transition-none',
          visible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-2 scale-[0.98] opacity-0'
        )}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div
          className={cn(
            'border-b px-5 py-4',
            headerAlign === 'center'
              ? 'relative text-center'
              : 'flex items-start justify-between gap-4'
          )}
        >
          <div className={cn(headerAlign === 'center' && 'mx-auto')}>
            <h2 className="text-lg font-semibold">{title}</h2>
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {canClose ? (
            <Button
              aria-label="Закрыть"
              className={cn(headerAlign === 'center' && 'absolute top-3 right-4')}
              onClick={onClose}
              size="icon-sm"
              type="button"
              variant="ghost"
            >
              <X />
            </Button>
          ) : null}
        </div>

        <div className="px-5 py-5">{children}</div>
      </div>
    </div>
  )
}
