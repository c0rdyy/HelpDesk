import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Dispatch, SetStateAction } from 'react'

import { getApiErrorMessage } from '@/lib/utils'
import { requestsApi } from '@/shared/api/requests-api'
import type {
  HelpDeskRequest,
  RequestCreatePayload,
  RequestListParams,
  RequestStatus
} from '@/shared/api/types'

import { PAGE_SIZE } from '../constants'
import { sortToParams } from '../lib/sort'
import type {
  FilterPriority,
  FilterStatus,
  RequestListState,
  SortValue
} from '../types'

interface UseHelpDeskRequestsResult {
  searchDraft: string
  setSearchDraft: Dispatch<SetStateAction<string>>
  status: FilterStatus
  setStatus: (value: FilterStatus) => void
  priority: FilterPriority
  setPriority: (value: FilterPriority) => void
  sort: SortValue
  setSort: (value: SortValue) => void
  page: number
  setPage: Dispatch<SetStateAction<number>>
  pages: number
  requestState: RequestListState
  feedbackMessage: string | null
  isLoading: boolean
  pendingRequestId: number | null
  clearFeedback: () => void
  resetFilters: () => void
  reload: () => void
  createRequest: (payload: RequestCreatePayload) => Promise<void>
  updateStatus: (
    request: HelpDeskRequest,
    nextStatus: RequestStatus
  ) => Promise<void>
  deleteRequest: (request: HelpDeskRequest) => Promise<void>
}

interface UseHelpDeskRequestsOptions {
  enabled?: boolean
}

export function useHelpDeskRequests({
  enabled = true
}: UseHelpDeskRequestsOptions = {}): UseHelpDeskRequestsResult {
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
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [pendingRequestId, setPendingRequestId] = useState<number | null>(null)

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
      page_size: PAGE_SIZE,
      ...sortParams
    }
  }, [page, priority, search, sort, status])

  useEffect(() => {
    if (!enabled) {
      return undefined
    }

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
          const message = getApiErrorMessage(
            error,
            'Не удалось загрузить заявки'
          )

          setRequestState((current) => ({
            status: 'error',
            data: current.data,
            error: message
          }))
        }
      }
    }

    void loadRequests()

    return () => {
      ignore = true
    }
  }, [enabled, query, reloadKey])

  const visibleRequestState: RequestListState = enabled
    ? requestState
    : { status: 'loading', data: null }
  const requests = visibleRequestState.data
  const pages = requests?.pages ?? 1
  const isLoading = visibleRequestState.status === 'loading'

  const reload = useCallback(() => {
    setReloadKey((value) => value + 1)
  }, [])

  const clearFeedback = useCallback(() => {
    setFeedbackMessage(null)
  }, [])

  useEffect(() => {
    if (!feedbackMessage) {
      return undefined
    }

    const timerId = window.setTimeout(() => setFeedbackMessage(null), 3500)

    return () => window.clearTimeout(timerId)
  }, [feedbackMessage])

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

  const createRequest = useCallback(
    async (payload: RequestCreatePayload) => {
      await requestsApi.create(payload)

      setPage(1)
      setSortState('created_desc')
      setFeedbackMessage('Заявка создана')
      reload()
    },
    [reload]
  )

  const updateStatus = useCallback(
    async (request: HelpDeskRequest, nextStatus: RequestStatus) => {
      if (request.status === nextStatus) {
        return
      }

      setPendingRequestId(request.id)

      try {
        const updated = await requestsApi.updateStatus(request.id, nextStatus)

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
        setFeedbackMessage('Статус обновлен')
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
    []
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
        setFeedbackMessage('Заявка удалена')
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
    [page, reload, requests]
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
    requestState: visibleRequestState,
    feedbackMessage,
    isLoading,
    pendingRequestId,
    clearFeedback,
    resetFilters,
    reload,
    createRequest,
    updateStatus,
    deleteRequest
  }
}
