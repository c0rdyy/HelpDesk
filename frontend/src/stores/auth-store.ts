import { getApiErrorMessage } from '@/lib/utils'
import { authApi } from '@/shared/api/auth-api'
import { getAuthToken, setAuthToken } from '@/shared/api/auth-token'
import { setUnauthorizedHandler } from '@/shared/api/http'
import type { LoginRequest, UserInfo } from '@/shared/api/types'
import { create } from 'zustand'

type AuthState = {
  user: UserInfo | null
  bootstraped: boolean
  isAuthLoading: boolean
  authError: string | null
  bootstrap: () => Promise<void>
  login: (payload: LoginRequest) => Promise<void>
  logout: () => void
  clearAuthError: () => void
  fetchMe: () => Promise<void>
}

function profileToUser(profile: {
  id: number
  username: string
  is_admin: boolean
}): UserInfo {
  return {
    id: profile.id,
    username: profile.username,
    is_admin: profile.is_admin
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  bootstraped: false,
  isAuthLoading: false,
  authError: null,
  bootstrap: async () => {
    if (get().bootstraped) {
      return
    }

    set({ isAuthLoading: true, authError: null })

    try {
      if (!getAuthToken()) {
        set({ user: null, bootstraped: true, isAuthLoading: false })
        return
      }

      const profile = await authApi.me()

      set({
        user: profileToUser(profile),
        bootstraped: true,
        isAuthLoading: false
      })
    } catch {
      setAuthToken(null)
      set({
        user: null,
        bootstraped: true,
        isAuthLoading: false
      })
    }
  },
  login: async (payload) => {
    set({ isAuthLoading: true, authError: null })

    try {
      const { access_token } = await authApi.login(payload)

      setAuthToken(access_token)
      set({ isAuthLoading: false, authError: null })
    } catch (error) {
      set({
        isAuthLoading: false,
        authError: getApiErrorMessage(error, 'Не удалось войти')
      })

      throw error
    }
  },
  logout: async () => {
    setAuthToken(null)
    set({ user: null, authError: null })
  },
  clearAuthError: async () => {
    set({ authError: null })
  },
  fetchMe: async () => {
    if (!getAuthToken()) {
      set({ user: null })
      return
    }

    try {
      const profile = await authApi.me()

      set({
        user: profileToUser(profile),
        isAuthLoading: false,
        authError: null
      })
    } catch (error) {
      setAuthToken(null)
      set({
        user: null,
        isAuthLoading: false,
        authError: getApiErrorMessage(
          error,
          'Не удалось получить данные пользователя'
        )
      })
    }
  }
}))

setUnauthorizedHandler(() => {
  const { user } = useAuthStore.getState()

  if (!user) {
    return
  }

  setAuthToken(null)
  useAuthStore.setState({
    user: null,
    authError: 'Сессия истекла, войдите снова'
  })
})
