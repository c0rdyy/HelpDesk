import { Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'

import { cn } from '@/lib/utils'

interface DashboardCardProps {
  count?: number | null
  description: string
  disabled?: boolean
  isLoadingCount?: boolean
  title: string
  to?: string
}

export function DashboardCard({
  count,
  description,
  disabled = false,
  isLoadingCount = false,
  title,
  to
}: DashboardCardProps) {
  const content = (
    <>
      <div className="mt-4 space-y-1">
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="mt-4 text-2xl font-bold">
        {isLoadingCount ? (
          <Loader2 className="size-5 animate-spin text-muted-foreground" />
        ) : count === null || count === undefined ? (
          <span className="text-base font-normal text-muted-foreground">—</span>
        ) : (
          count
        )}
      </div>
    </>
  )

  const className = cn(
    'block rounded-lg border border-border bg-card p-4 transition-[border-color,box-shadow,transform] duration-200 ease-[var(--ease-out-quart)]',
    disabled
      ? 'cursor-not-allowed opacity-60'
      : 'hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-sm motion-reduce:transform-none motion-reduce:transition-none'
  )

  if (disabled || !to) {
    return (
      <div aria-disabled={disabled} className={className}>
        {content}
      </div>
    )
  }

  return (
    <Link className={className} to={to}>
      {content}
    </Link>
  )
}
