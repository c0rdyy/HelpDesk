import { http } from './http'
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserInfo
} from './types'

export const authApi = {
  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>('/auth/register', payload)

    return data
  },
  async login(payload: LoginRequest): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>('/auth/login', payload)

    return data
  },
  async refresh(): Promise<AuthResponse> {
    const { data } = await http.post<AuthResponse>('/auth/refresh')

    return data
  },
  async logout(): Promise<void> {
    await http.post('/auth/logout')
  },
  async me(): Promise<UserInfo> {
    const { data } = await http.get<UserInfo>('/users/me')

    return data
  }
}
