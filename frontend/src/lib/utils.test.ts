import { AxiosError, AxiosHeaders } from 'axios'
import { describe, expect, it } from 'vitest'

import { getApiErrorMessage } from './utils'

function createAxiosError(status: number, data: unknown): AxiosError {
  return new AxiosError(
    'Request failed',
    String(status),
    undefined,
    undefined,
    {
      status,
      statusText: '',
      headers: new AxiosHeaders(),
      config: { headers: new AxiosHeaders() },
      data
    }
  )
}

describe('getApiErrorMessage', () => {
  it('returns "detail" from a FastAPI-style error response', () => {
    const error = createAxiosError(404, { detail: 'Request not found' })

    expect(getApiErrorMessage(error)).toBe('Request not found')
  })

  it('returns the message of a plain Error', () => {
    expect(getApiErrorMessage(new Error('Network Error'))).toBe('Network Error')
  })

  it('falls back to the default message for unknown error shapes', () => {
    expect(getApiErrorMessage('boom')).toBe('Что-то пошло не так')
  })

  it('falls back to a custom message when provided', () => {
    expect(getApiErrorMessage('boom', 'Не удалось выполнить запрос')).toBe(
      'Не удалось выполнить запрос'
    )
  })
})
