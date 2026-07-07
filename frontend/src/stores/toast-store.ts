import { create } from 'zustand'

export type ToastVariant = 'success' | 'error'

export type Toast = {
  id: string
  message: string
  variant: ToastVariant
}

type ToastState = {
  toasts: Toast[]
  addToast: (message: string, variant?: ToastVariant) => void
  removeToast: (id: string) => void
}

const TOAST_DURATION_MS = 4000

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  addToast: (message, variant = 'success') => {
    const id = crypto.randomUUID()

    set((state) => ({ toasts: [...state.toasts, { id, message, variant }] }))

    window.setTimeout(() => {
      get().removeToast(id)
    }, TOAST_DURATION_MS)
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id)
    }))
  }
}))
