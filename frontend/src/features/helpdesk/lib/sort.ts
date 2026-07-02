import type {
  RequestListParams,
  RequestSortBy,
  RequestSortOrder
} from '@/shared/api/types'

import type { SortValue } from '../types'

type SortParams = Pick<RequestListParams, 'sort_by' | 'sort_order'> & {
  sort_by: RequestSortBy
  sort_order: RequestSortOrder
}

function assertNever(value: never): never {
  throw new Error(`Unhandled sort value: ${value}`)
}

export function sortToParams(sort: SortValue): SortParams {
  switch (sort) {
    case 'priority_desc':
      return { sort_by: 'priority', sort_order: 'desc' }
    case 'priority_asc':
      return { sort_by: 'priority', sort_order: 'asc' }
    case 'created_asc':
      return { sort_by: 'created_at', sort_order: 'asc' }
    case 'created_desc':
      return { sort_by: 'created_at', sort_order: 'desc' }
    default:
      return assertNever(sort)
  }
}
