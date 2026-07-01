export type ApiErrorResponce = {
  detail: string
}

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
