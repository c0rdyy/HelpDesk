import { useCallback, useEffect, useState } from 'react'

import { getApiErrorMessage } from '@/lib/utils'
import { adminUsersApi } from '@/shared/api/admin-users-api'
import type { AdminUserInfo, UserRole } from '@/shared/api/types'
import { useToastStore } from '@/stores/toast-store'

import { USERS_PAGE_SIZE } from '../constants'
import type { AdminUserListState } from '../types'

export function useAdminUsers() {
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [state, setState] = useState<AdminUserListState>({
    status: 'loading',
    data: null
  })
  const [pendingUserId, setPendingUserId] = useState<number | null>(null)
  const addToast = useToastStore((state) => state.addToast)

  useEffect(() => {
    let ignore = false

    async function load() {
      setState((current) => ({ status: 'loading', data: current.data }))

      try {
        const data = await adminUsersApi.getList({
          page,
          page_size: USERS_PAGE_SIZE
        })

        if (!ignore) {
          setState({ status: 'success', data })
        }
      } catch (error) {
        if (!ignore) {
          setState((current) => ({
            status: 'error',
            data: current.data,
            error: getApiErrorMessage(
              error,
              'Не удалось загрузить пользователей'
            )
          }))
        }
      }
    }

    void load()

    return () => {
      ignore = true
    }
  }, [page, reloadKey])

  const reload = useCallback(() => {
    setReloadKey((value) => value + 1)
  }, [])

  const replaceUser = useCallback((updated: AdminUserInfo) => {
    setState((current) =>
      current.data
        ? {
            status: 'success',
            data: {
              ...current.data,
              items: current.data.items.map((item) =>
                item.id === updated.id ? updated : item
              )
            }
          }
        : current
    )
  }, [])

  const changeRole = useCallback(
    async (user: AdminUserInfo, role: UserRole) => {
      setPendingUserId(user.id)

      try {
        const updated = await adminUsersApi.updateRole(user.id, { role })
        replaceUser(updated)
        addToast('Роль обновлена')
      } catch (error) {
        addToast(getApiErrorMessage(error, 'Не удалось изменить роль'), 'error')
      } finally {
        setPendingUserId(null)
      }
    },
    [addToast, replaceUser]
  )

  const toggleBlock = useCallback(
    async (user: AdminUserInfo) => {
      setPendingUserId(user.id)

      try {
        const updated = await adminUsersApi.updateBlock(user.id, {
          is_active: !user.is_active
        })
        replaceUser(updated)
        addToast(
          updated.is_active
            ? 'Пользователь разблокирован'
            : 'Пользователь заблокирован'
        )
      } catch (error) {
        addToast(
          getApiErrorMessage(error, 'Не удалось изменить статус блокировки'),
          'error'
        )
      } finally {
        setPendingUserId(null)
      }
    },
    [addToast, replaceUser]
  )

  return {
    state,
    page,
    setPage,
    pages: state.data?.pages ?? 1,
    isLoading: state.status === 'loading',
    reload,
    pendingUserId,
    changeRole,
    toggleBlock
  }
}
