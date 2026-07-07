import { useEffect, useState } from 'react'

import { adminUsersApi } from '@/shared/api/admin-users-api'
import { requestsApi } from '@/shared/api/requests-api'

export function useDashboardCounts() {
  const [userCount, setUserCount] = useState<number | null>(null)
  const [requestCount, setRequestCount] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        const [users, requests] = await Promise.all([
          adminUsersApi.getList({ page: 1, page_size: 1 }),
          requestsApi.getList({ page: 1, page_size: 1 })
        ])

        if (!ignore) {
          setUserCount(users.total)
          setRequestCount(requests.total)
        }
      } catch {
        // Counts are a non-critical enhancement — leave them blank on failure.
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void load()

    return () => {
      ignore = true
    }
  }, [])

  return { userCount, requestCount, isLoading }
}
