import { isAxiosError } from '@/shared/api/http'
import type { ApiErrorResponse, ApiValidationIssue } from '@/shared/api/types'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const FIELD_LABELS: Record<string, string> = {
  confirm_password: 'Подтверждение пароля',
  description: 'Описание',
  email: 'Email',
  password: 'Пароль',
  phone: 'Телефон',
  search: 'Поиск',
  title: 'Заголовок',
  username: 'Логин'
}

function formatCount(value: number, one: string, few: string, many: string) {
  const lastTwoDigits = value % 100
  const lastDigit = value % 10

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${value} ${many}`
  }

  if (lastDigit === 1) {
    return `${value} ${one}`
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${value} ${few}`
  }

  return `${value} ${many}`
}

function getIssueField(issue: ApiValidationIssue): string {
  const field = [...issue.loc]
    .reverse()
    .find((locationPart) => typeof locationPart === 'string')

  if (!field || field === 'body' || field === 'query' || field === 'path') {
    return 'Поле'
  }

  return FIELD_LABELS[field] ?? field
}

function getContextNumber(
  issue: ApiValidationIssue,
  key: string
): number | null {
  const value = issue.ctx?.[key]

  return typeof value === 'number' ? value : null
}

function normalizePydanticMessage(message: string): string {
  if (message.includes('Passwords do not match')) {
    return 'Пароли не совпадают'
  }

  return message
}

function normalizeApiDetailMessage(message: string): string {
  const normalizedMessage = normalizePydanticMessage(message)

  if (normalizedMessage === 'Invalid username or password') {
    return 'Неверный логин или пароль'
  }

  if (normalizedMessage === 'User with this username already exists') {
    return 'Пользователь с таким логином уже существует'
  }

  if (normalizedMessage === 'User with this email already exists') {
    return 'Пользователь с таким email уже существует'
  }

  return normalizedMessage
}

function getValidationIssueMessage(issue: ApiValidationIssue): string {
  const field = getIssueField(issue)
  const quotedField = field === 'Поле' ? field : `Поле «${field}»`

  if (issue.type === 'missing') {
    return `${quotedField} нужно заполнить`
  }

  if (issue.type === 'string_too_short') {
    const minLength = getContextNumber(issue, 'min_length')

    if (minLength !== null) {
      return `${quotedField} должно быть не короче ${formatCount(
        minLength,
        'символ',
        'символа',
        'символов'
      )}`
    }
  }

  if (issue.type === 'string_too_long') {
    const maxLength = getContextNumber(issue, 'max_length')

    if (maxLength !== null) {
      return `${quotedField} должно быть не длиннее ${formatCount(
        maxLength,
        'символ',
        'символа',
        'символов'
      )}`
    }
  }

  if (
    issue.type.includes('email') ||
    (field === 'Email' && issue.msg.toLowerCase().includes('email'))
  ) {
    return `${quotedField} должно быть корректным email-адресом`
  }

  if (issue.type.includes('enum')) {
    return `${quotedField}: выберите значение из списка`
  }

  return normalizeApiDetailMessage(issue.msg)
}

function getValidationMessage(issues: ApiValidationIssue[]): string {
  return issues.map(getValidationIssueMessage).join('. ')
}

export function getApiErrorMessage(
  error: unknown,
  fallback = 'Что-то пошло не так'
): string {
  if (isAxiosError<ApiErrorResponse>(error)) {
    const data = error.response?.data

    if (data && typeof data.detail === 'string') {
      return normalizeApiDetailMessage(data.detail)
    }

    if (data && Array.isArray(data.detail) && data.detail.length > 0) {
      return getValidationMessage(data.detail)
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}
