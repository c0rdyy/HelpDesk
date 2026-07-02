import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { buildPageItems } from '../lib/pagination'

interface PaginationControlsProps {
  isLoading: boolean
  onPageChange: (page: number) => void
  page: number
  pages: number
}

export function PaginationControls({
  isLoading,
  onPageChange,
  page,
  pages
}: PaginationControlsProps) {
  return (
    <div className="flex items-center justify-center gap-1">
      <Button
        aria-label="Предыдущая страница"
        disabled={page <= 1 || isLoading}
        onClick={() => onPageChange(Math.max(1, page - 1))}
        size="icon-sm"
        title="Предыдущая страница"
        type="button"
        variant="outline"
      >
        <ChevronLeft />
      </Button>

      {buildPageItems(page, pages || 1).map((item, index) =>
        item === 'ellipsis' ? (
          <span
            className="flex size-8 items-center justify-center text-sm text-muted-foreground"
            key={`ellipsis-${index}`}
          >
            ...
          </span>
        ) : (
          <Button
            disabled={isLoading}
            key={item}
            onClick={() => onPageChange(item)}
            size="icon-sm"
            type="button"
            variant={item === page ? 'default' : 'outline'}
          >
            {item}
          </Button>
        )
      )}

      <Button
        aria-label="Следующая страница"
        disabled={page >= pages || isLoading}
        onClick={() => onPageChange(Math.min(pages || 1, page + 1))}
        size="icon-sm"
        title="Следующая страница"
        type="button"
        variant="outline"
      >
        <ChevronRight />
      </Button>
    </div>
  )
}
