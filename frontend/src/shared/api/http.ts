import axios from 'axios'
import type { AxiosError, InternalAxiosRequestConfig } from 'axios'

import { getAuthToken, setAuthToken } from './auth-token'
import type { AuthResponse } from './types'

const baseURL = import.meta.env.VITE_API_URL

if (!baseURL) {
  throw new Error('VITE_API_URL is not set in .env')
}

export const http = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

const refreshHttp = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
})

http.interceptors.request.use((config) => {
  const token = getAuthToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

type UnauthorizedHandler = () => void

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

let unauthorizedHandler: UnauthorizedHandler | null = null

export function setUnauthorizedHandler(handler: UnauthorizedHandler) {
  unauthorizedHandler = handler
}

function isAuthEndpoint(url?: string): boolean {
  if (!url) {
    return false
  }

  return [
    '/auth/login',
    '/auth/logout',
    '/auth/refresh',
    '/auth/register'
  ].some((endpoint) => url.includes(endpoint))
}

async function refreshAccessToken(): Promise<string> {
  const { data } = await refreshHttp.post<AuthResponse>('/auth/refresh')

  setAuthToken(data.access_token)

  return data.access_token
}

http.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error) || error.response?.status !== 401) {
      return Promise.reject(error)
    }

    const originalRequest = error.config as RetriableRequestConfig | undefined

    if (
      !originalRequest ||
      originalRequest._retry ||
      isAuthEndpoint(originalRequest.url)
    ) {
      if (!isAuthEndpoint(originalRequest?.url)) {
        unauthorizedHandler?.()
      }

      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      const accessToken = await refreshAccessToken()

      originalRequest.headers.Authorization = `Bearer ${accessToken}`

      return http(originalRequest)
    } catch (refreshError) {
      setAuthToken(null)
      unauthorizedHandler?.()

      return Promise.reject(refreshError)
    }
  }
)

export type ApiValidationError = {
  detail: Array<{
    loc: (string | number)[]
    msg: string
    type: string
    input: unknown
    ctx?: Record<string, unknown>
  }>
}

export function isAxiosError<T = unknown>(e: unknown): e is AxiosError<T> {
  return axios.isAxiosError(e)
}
