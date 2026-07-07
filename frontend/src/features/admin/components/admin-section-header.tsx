import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/button'

interface AdminSectionHeaderProps {
  action?: ReactNode
  title: string
}

export function AdminSectionHeader({ action, title }: AdminSectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-3 border-b px-4 py-4">
      <div className="flex items-center gap-3">
        <Button
          asChild
          size="icon-sm"
          title="Назад к дашборду"
          variant="outline"
        >
          <Link aria-label="Назад к дашборду" to="/admin">
            <ArrowLeft />
          </Link>
        </Button>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>

      {action}
    </div>
  )
}
