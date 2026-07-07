import { useState } from 'react'
import type { FormEvent } from 'react'

import { getApiErrorMessage } from '@/lib/utils'
import type { UserInfo } from '@/shared/api/types'
import { useAuthStore } from '@/stores/auth-store'

import type { ProfileFormState } from '../types'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const emptyProfileForm: ProfileFormState = {
  username: '',
  full_name: '',
  email: '',
  phone: ''
}

function formFromUser(user: UserInfo): ProfileFormState {
  return {
    username: user.username,
    full_name: user.full_name ?? '',
    email: user.email,
    phone: user.phone ?? ''
  }
}

function validateProfileForm(form: ProfileFormState): string | null {
  const username = form.username.trim()
  const email = form.email.trim()
  const fullName = form.full_name.trim()
  const phone = form.phone.trim()

  if (username.length < 3) {
    return 'Поле «Логин» должно быть не короче 3 символов'
  }

  if (username.length > 50) {
    return 'Поле «Логин» должно быть не длиннее 50 символов'
  }

  if (!email) {
    return 'Поле «Email» нужно заполнить'
  }

  if (!EMAIL_PATTERN.test(email)) {
    return 'Поле «Email» должно быть корректным email-адресом'
  }

  if (fullName.length > 160) {
    return 'Поле «ФИО» должно быть не длиннее 160 символов'
  }

  if (phone.length > 32) {
    return 'Поле «Телефон» должно быть не длиннее 32 символов'
  }

  return null
}

export function useProfileEditor(user: UserInfo | null) {
  const updateProfile = useAuthStore((state) => state.updateProfile)
  const [isOpen, setOpen] = useState(false)
  const [form, setForm] = useState<ProfileFormState>(emptyProfileForm)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setSubmitting] = useState(false)

  function openProfile() {
    if (!user) {
      return
    }

    setForm(formFromUser(user))
    setError(null)
    setOpen(true)
  }

  function closeProfile() {
    setOpen(false)
    setError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationError = validateProfileForm(form)

    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setSubmitting(true)

    try {
      await updateProfile({
        username: form.username.trim(),
        email: form.email.trim(),
        full_name: form.full_name.trim() || null,
        phone: form.phone.trim() || null
      })
      setOpen(false)
    } catch (submitError) {
      setError(getApiErrorMessage(submitError, 'Не удалось сохранить профиль'))
    } finally {
      setSubmitting(false)
    }
  }

  return {
    isOpen,
    form,
    error,
    isSubmitting,
    openProfile,
    closeProfile,
    setForm,
    handleSubmit
  }
}
