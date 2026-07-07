import { CheckCircle2, AlertCircle, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useToastStore } from '@/stores/toast-store'

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts)
  const removeToast = useToastStore((state) => state.removeToast)

  if (toasts.length === 0) {
    return null
  }

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-4 sm:items-end"
    >
      {toasts.map((toast) => (
        <div
          className={cn(
            'motion-toast pointer-events-auto flex w-full items-center gap-3 rounded-lg border bg-card p-3.5 text-card-foreground shadow-lg ring-1 ring-foreground/10 sm:w-96',
            toast.variant === 'error' ? 'border-destructive/30' : 'border-border'
          )}
          key={toast.id}
          role="status"
        >
          {toast.variant === 'error' ? (
            <AlertCircle className="size-7 shrink-0 text-destructive" />
          ) : (
            <CheckCircle2 className="size-7 shrink-0 text-emerald-600" />
          )}

          <p className="flex-1 text-sm leading-snug font-medium">
            {toast.message}
          </p>

          <Button
            aria-label="Скрыть уведомление"
            className="shrink-0"
            onClick={() => removeToast(toast.id)}
            size="icon-xs"
            type="button"
            variant="ghost"
          >
            <X />
          </Button>
        </div>
      ))}
    </div>
  )
}
