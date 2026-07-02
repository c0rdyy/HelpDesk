export type ApiErrorResponse = {
  detail: string
}

export type ApiErrorResponce = ApiErrorResponse

export type LoginRequest = {
  username: string
  password: string
}

export type AuthResponse = {
  access_token: string
  token_type: string
}

export type UserInfo = {
  id: number
  username: string
  is_admin: boolean
}

export type RequestStatus = 'new' | 'in_progress' | 'done'

export type RequestPriority = 'low' | 'normal' | 'high'

export type HelpDeskRequest = {
  id: number
  title: string
  description: string | null
  status: RequestStatus
  priority: RequestPriority
  created_at: string
  updated_at: string
}

export type RequestListResponse = {
  items: HelpDeskRequest[]
  total: number
  page: number
  page_size: number
  pages: number
}

export type RequestSortBy = 'created_at' | 'priority'

export type RequestSortOrder = 'asc' | 'desc'

export type RequestListParams = {
  status?: RequestStatus
  priority?: RequestPriority
  search?: string
  sort_by?: RequestSortBy
  sort_order?: RequestSortOrder
  page?: number
  page_size?: number
}

export type RequestCreatePayload = {
  title: string
  description?: string | null
  priority: RequestPriority
}

export type RequestStatusUpdatePayload = {
  status: RequestStatus
}
