export type ApiValidationIssue = {
  loc: (string | number)[]
  msg: string
  type: string
  input?: unknown
  ctx?: Record<string, unknown>
}

export type ApiErrorResponse = {
  detail: string | ApiValidationIssue[]
}

export type ApiErrorResponce = ApiErrorResponse

export type LoginRequest = {
  username: string
  password: string
  remember_me?: boolean
}

export type RegisterRequest = {
  username: string
  email: string
  password: string
  confirm_password: string
}

export type AuthResponse = {
  access_token: string
  token_type: string
}

export type UserInfo = {
  id: number
  username: string
  email: string
  full_name: string | null
  phone: string | null
  is_admin: boolean
}

export type ProfileUpdatePayload = {
  username: string
  email: string
  full_name: string | null
  phone: string | null
}

export type UserRole = 'admin' | 'user'

export type RequestStatus = 'new' | 'in_progress' | 'done'

export type RequestPriority = 'low' | 'normal' | 'high'

export type RequestCreatorInfo = {
  id: number
  username: string
}

export type HelpDeskRequest = {
  id: number
  title: string
  description: string | null
  status: RequestStatus
  priority: RequestPriority
  creator: RequestCreatorInfo
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
  creator_id?: number
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

export type RequestUpdatePayload = {
  title: string
  description: string | null
  priority: RequestPriority
}

export type RequestStatusUpdatePayload = {
  status: RequestStatus
}

export type AdminUserInfo = {
  id: number
  username: string
  email: string
  full_name: string | null
  role: UserRole
  is_active: boolean
  is_verified: boolean
  created_at: string
  last_login_at: string | null
  blocked_at: string | null
}

export type AdminUserListResponse = {
  items: AdminUserInfo[]
  total: number
  page: number
  page_size: number
  pages: number
}

export type AdminUserListParams = {
  page?: number
  page_size?: number
}

export type UpdateUserRolePayload = {
  role: UserRole
}

export type UpdateUserBlockPayload = {
  is_active: boolean
}
