import { isAxiosError } from '@/shared/api/http'
import type { ApiErrorResponce } from '@/shared/api/types'
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getApiErrorMessage(
  error: unknown, 
  fallback = 'Что-то пошло не так'
): string {
  if (isAxiosError<ApiErrorResponce>(error)) {
    const data = error.response?.data

    if (data && typeof data.detail === 'string') {
      return data.detail
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}