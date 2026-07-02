import type { RequestPriority } from '@/shared/api/types'

import type { SortValue } from './types'

export const PAGE_SIZE = 6

type BadgeMeta = {
  label: string
  className: string
}

export const priorityMeta = {
  low: {
    label: 'Низкий',
    className: 'border-zinc-200 bg-zinc-50 text-zinc-700'
  },
  normal: {
    label: 'Обычный',
    className: 'border-indigo-200 bg-indigo-50 text-indigo-800'
  },
  high: {
    label: 'Высокий',
    className: 'border-rose-200 bg-rose-50 text-rose-800'
  }
} satisfies Record<RequestPriority, BadgeMeta>

export const sortLabels = {
  created_desc: 'Сначала новые',
  created_asc: 'Сначала старые',
  priority_desc: 'Приоритет: высокий',
  priority_asc: 'Приоритет: низкий'
} satisfies Record<SortValue, string>
