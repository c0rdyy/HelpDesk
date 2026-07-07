import type {
  HelpDeskRequest,
  RequestListResponse,
  RequestPriority,
  RequestStatus
} from '@/shared/api/types'

export type FilterStatus = RequestStatus | 'all'

export type FilterPriority = RequestPriority | 'all'

export type SortValue =
  'created_desc' | 'created_asc' | 'priority_desc' | 'priority_asc'

export type RequestFormState = {
  title: string
  description: string
  priority: RequestPriority
}

export type LoginFormState = {
  username: string
  password: string
  remember_me: boolean
}

export type RegisterFormState = {
  username: string
  email: string
  password: string
  confirm_password: string
}

export type ProfileFormState = {
  username: string
  full_name: string
  email: string
  phone: string
}

export type RequestListState =
  | { status: 'loading'; data: RequestListResponse | null }
  | { status: 'success'; data: RequestListResponse }
  | { status: 'error'; data: RequestListResponse | null; error: string }

export interface RequestStatusChange {
  request: HelpDeskRequest
  status: RequestStatus
}
