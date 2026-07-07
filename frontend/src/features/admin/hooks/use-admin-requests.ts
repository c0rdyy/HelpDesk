import { useCallback, useEffect, useMemo, useState } from 'react'

import { sortToParams } from '@/features/helpdesk/lib/sort'
import type {
  FilterPriority,
  FilterStatus,
  RequestListState,
  SortValue
} from '@/features/helpdesk/types'
import { getApiErrorMessage } from '@/lib/utils'
import { requestsApi } from '@/shared/api/requests-api'
import type {
  HelpDeskRequest,
  RequestCreatePayload,
  RequestListParams,
  RequestStatus,
  RequestUpdatePayload
} from '@/shared/api/types'
import { useToastStore } from '@/stores/toast-store'

import { ADMIN_REQUESTS_PAGE_SIZE } from '../constants'

export function useAdminRequests() {
  const [searchDraft, setSearchDraft] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatusState] = useState<FilterStatus>('all')
  const [priority, setPriorityState] = useState<FilterPriority>('all')
  const [sort, setSortState] = useState<SortValue>('created_desc')
  const [page, setPage] = useState(1)
  const [reloadKey, setReloadKey] = useState(0)
  const [requestState, setRequestState] = useState<RequestListState>({
    status: 'loading',
    data: null
  })
  const [pendingRequestId, setPendingRequestId] = useState<number | null>(null)
  const addToast = useToastStore((state) => state.addToast)

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setSearch(searchDraft.trim())
      setPage(1)
    }, 300)

    return () => window.clearTimeout(timerId)
  }, [searchDraft])

  const query = useMemo<RequestListParams>(() => {
    const sortParams = sortToParams(sort)

    return {
      status: status === 'all' ? undefined : status,
      priority: priority === 'all' ? undefined : priority,
      search: search || undefined,
      page,
      page_size: ADMIN_REQUESTS_PAGE_SIZE,
      ...sortParams
    }
  }, [page, priority, search, sort, status])

  useEffect(() => {
    let ignore = false

    async function loadRequests() {
      setRequestState((current) => ({ status: 'loading', data: current.data }))

      try {
        const data = await requestsApi.getList(query)

        if (!ignore) {
          setRequestState({ status: 'success', data })
        }
      } catch (error) {
        if (!ignore) {
          setRequestState((current) => ({
            status: 'error',
            data: current.data,
            error: getApiErrorMessage(error, 'Не удалось загрузить заявки')
          }))
        }
      }
    }

    void loadRequests()

    return () => {
      ignore = true
    }
  }, [query, reloadKey])

  const requests = requestState.data
  const pages = requests?.pages ?? 1
  const isLoading = requestState.status === 'loading'

  const reload = useCallback(() => {
    setReloadKey((value) => value + 1)
  }, [])

  const setStatus = useCallback((value: FilterStatus) => {
    setStatusState(value)
    setPage(1)
  }, [])

  const setPriority = useCallback((value: FilterPriority) => {
    setPriorityState(value)
    setPage(1)
  }, [])

  const setSort = useCallback((value: SortValue) => {
    setSortState(value)
    setPage(1)
  }, [])

  const resetFilters = useCallback(() => {
    setStatusState('all')
    setPriorityState('all')
    setSortState('created_desc')
    setSearchDraft('')
    setSearch('')
    setPage(1)
  }, [])

  const replaceRequest = useCallback((updated: HelpDeskRequest) => {
    setRequestState((current) =>
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

  const createRequest = useCallback(
    async (payload: RequestCreatePayload) => {
      await requestsApi.create(payload)

      setPage(1)
      setSortState('created_desc')
      addToast('Заявка создана')
      reload()
    },
    [addToast, reload]
  )

  const updateStatus = useCallback(
    async (request: HelpDeskRequest, nextStatus: RequestStatus) => {
      if (request.status === nextStatus) {
        return
      }

      setPendingRequestId(request.id)

      try {
        const updated = await requestsApi.updateStatus(request.id, nextStatus)
        replaceRequest(updated)
        addToast('Статус обновлен')
      } catch (error) {
        const message = getApiErrorMessage(error, 'Не удалось изменить статус')
        setRequestState((current) => ({
          status: 'error',
          data: current.data,
          error: message
        }))
      } finally {
        setPendingRequestId(null)
      }
    },
    [addToast, replaceRequest]
  )

  const updateRequest = useCallback(
    async (request: HelpDeskRequest, payload: RequestUpdatePayload) => {
      setPendingRequestId(request.id)

      try {
        const updated = await requestsApi.update(request.id, payload)
        replaceRequest(updated)
        addToast('Заявка обновлена')
      } finally {
        setPendingRequestId(null)
      }
    },
    [addToast, replaceRequest]
  )

  const deleteRequest = useCallback(
    async (request: HelpDeskRequest) => {
      setPendingRequestId(request.id)

      try {
        await requestsApi.delete(request.id)

        if (requests && requests.items.length === 1 && page > 1) {
          setPage((value) => value - 1)
        } else {
          reload()
        }
        addToast('Заявка удалена')
      } catch (error) {
        const message = getApiErrorMessage(error, 'Не удалось удалить заявку')

        setRequestState((current) => ({
          status: 'error',
          data: current.data,
          error: message
        }))
      } finally {
        setPendingRequestId(null)
      }
    },
    [addToast, page, reload, requests]
  )

  return {
    searchDraft,
    setSearchDraft,
    status,
    setStatus,
    priority,
    setPriority,
    sort,
    setSort,
    page,
    setPage,
    pages,
    requestState,
    isLoading,
    pendingRequestId,
    resetFilters,
    reload,
    createRequest,
    updateStatus,
    updateRequest,
    deleteRequest
  }
}
