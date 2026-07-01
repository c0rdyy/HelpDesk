import { http } from './http'
import type { LoginRequest, AuthResponse, UserInfo } from './types'

export const authApi = {
  async login(payload: LoginRequest): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>("/auth/login", payload)

    return data
  },
  async me(): Promise<UserInfo> {
    const { data } = await http.get<UserInfo>("/auth/me")

    return data
  }
}
