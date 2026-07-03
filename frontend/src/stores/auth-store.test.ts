import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/shared/api/auth-api', () => ({
  authApi: {
    login: vi.fn(),
    me: vi.fn()
  }
}))

// Real auth-token.ts reads/writes the browser's localStorage. Mocking it with
// a simple in-memory value keeps this test independent from any particular
// localStorage implementation (jsdom vs. Node's own) and from previous tests.
vi.mock('@/shared/api/auth-token', () => {
  let token: string | null = null

  return {
    getAuthToken: () => token,
    setAuthToken: (value: string | null) => {
      token = value
    }
  }
})

import { authApi } from '@/shared/api/auth-api'
import { getAuthToken, setAuthToken } from '@/shared/api/auth-token'

import { useAuthStore } from './auth-store'

const mockedLogin = vi.mocked(authApi.login)
const mockedMe = vi.mocked(authApi.me)
const initialState = useAuthStore.getState()

beforeEach(() => {
  useAuthStore.setState(initialState, true)
  setAuthToken(null)
  mockedLogin.mockReset()
  mockedMe.mockReset()
})

describe('useAuthStore.login', () => {
  it('stores the access token and clears the error on success', async () => {
    mockedLogin.mockResolvedValue({
      access_token: 'token-123',
      token_type: 'bearer'
    })

    await useAuthStore
      .getState()
      .login({ username: 'admin', password: 'admin' })

    expect(getAuthToken()).toBe('token-123')
    expect(useAuthStore.getState().isAuthLoading).toBe(false)
    expect(useAuthStore.getState().authError).toBeNull()
  })

  it('sets an error message and rethrows on failure, without storing a token', async () => {
    mockedLogin.mockRejectedValue(new Error('Invalid credentials'))

    await expect(
      useAuthStore.getState().login({ username: 'admin', password: 'wrong' })
    ).rejects.toThrow('Invalid credentials')

    expect(getAuthToken()).toBeNull()
    expect(useAuthStore.getState().isAuthLoading).toBe(false)
    expect(useAuthStore.getState().authError).toBe('Invalid credentials')
  })
})

describe('useAuthStore.fetchMe', () => {
  it('loads the current user when a token is present', async () => {
    setAuthToken('token-123')
    mockedMe.mockResolvedValue({ id: 1, username: 'admin', is_admin: true })

    await useAuthStore.getState().fetchMe()

    expect(useAuthStore.getState().user).toEqual({
      id: 1,
      username: 'admin',
      is_admin: true
    })
    expect(useAuthStore.getState().authError).toBeNull()
  })

  it('clears the user without calling the API when there is no token', async () => {
    await useAuthStore.getState().fetchMe()

    expect(mockedMe).not.toHaveBeenCalled()
    expect(useAuthStore.getState().user).toBeNull()
  })

  it('clears the token and sets an error when the server rejects it', async () => {
    setAuthToken('expired-token')
    mockedMe.mockRejectedValue(new Error('Unauthorized'))

    await useAuthStore.getState().fetchMe()

    expect(getAuthToken()).toBeNull()
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().authError).toBe('Unauthorized')
  })
})

describe('useAuthStore.bootstrap', () => {
  it('calls the API only once, even if invoked multiple times', async () => {
    setAuthToken('token-123')
    mockedMe.mockResolvedValue({ id: 1, username: 'admin', is_admin: true })

    await useAuthStore.getState().bootstrap()
    await useAuthStore.getState().bootstrap()

    expect(mockedMe).toHaveBeenCalledTimes(1)
    expect(useAuthStore.getState().bootstraped).toBe(true)
  })

  it('does not call the API and marks itself as bootstrapped when there is no token', async () => {
    await useAuthStore.getState().bootstrap()

    expect(mockedMe).not.toHaveBeenCalled()
    expect(useAuthStore.getState().bootstraped).toBe(true)
    expect(useAuthStore.getState().user).toBeNull()
  })
})

describe('useAuthStore.logout', () => {
  it('clears the token and the user', () => {
    setAuthToken('token-123')
    useAuthStore.setState({
      user: { id: 1, username: 'admin', is_admin: true }
    })

    useAuthStore.getState().logout()

    expect(getAuthToken()).toBeNull()
    expect(useAuthStore.getState().user).toBeNull()
  })
})
