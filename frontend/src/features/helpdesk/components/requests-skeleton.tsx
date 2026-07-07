import { PAGE_SIZE } from '../constants'

export function RequestsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: PAGE_SIZE }, (_, index) => (
        <div
          className="min-h-36 animate-pulse rounded-lg border border-border bg-card p-4"
          key={index}
        >
          <div className="h-4 w-2/3 rounded bg-muted" />
          <div className="mt-4 h-3 w-full rounded bg-muted" />
          <div className="mt-2 h-3 w-3/4 rounded bg-muted" />
          <div className="mt-6 flex gap-2">
            <div className="h-5 w-16 rounded-full bg-muted" />
            <div className="h-5 w-20 rounded-full bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}
