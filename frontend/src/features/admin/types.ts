import type { AdminUserListResponse, RequestPriority } from '@/shared/api/types'

export type AdminUserListState =
  | { status: 'loading'; data: AdminUserListResponse | null }
  | { status: 'success'; data: AdminUserListResponse }
  | { status: 'error'; data: AdminUserListResponse | null; error: string }

export type RequestEditFormState = {
  title: string
  description: string
  priority: RequestPriority
}
