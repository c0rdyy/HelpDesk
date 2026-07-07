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

  it('translates common auth errors from the API', () => {
    const error = createAxiosError(401, {
      detail: 'Invalid username or password'
    })

    expect(getApiErrorMessage(error)).toBe('Неверный логин или пароль')
  })

  it('translates username conflict errors from the API', () => {
    const error = createAxiosError(409, {
      detail: 'User with this username already exists'
    })

    expect(getApiErrorMessage(error)).toBe(
      'Пользователь с таким логином уже существует'
    )
  })

  it('returns a readable message for FastAPI validation errors', () => {
    const error = createAxiosError(422, {
      detail: [
        {
          type: 'string_too_short',
          loc: ['body', 'username'],
          msg: 'String should have at least 3 characters',
          input: 'ad',
          ctx: { min_length: 3 }
        }
      ]
    })

    expect(getApiErrorMessage(error)).toBe(
      'Поле «Логин» должно быть не короче 3 символа'
    )
  })

  it('returns a readable message for too long fields', () => {
    const error = createAxiosError(422, {
      detail: [
        {
          type: 'string_too_long',
          loc: ['body', 'password'],
          msg: 'String should have at most 50 characters',
          input: 'x'.repeat(51),
          ctx: { max_length: 50 }
        }
      ]
    })

    expect(getApiErrorMessage(error)).toBe(
      'Поле «Пароль» должно быть не длиннее 50 символов'
    )
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
