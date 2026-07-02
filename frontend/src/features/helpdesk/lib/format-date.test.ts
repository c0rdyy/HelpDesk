import { describe, expect, it } from 'vitest'

import { formatDate } from './format-date'

describe('formatDate', () => {
  it('formats an ISO date string as ru-RU date and time', () => {
    // No trailing "Z": parsed as local wall-clock time, so the assertion
    // stays correct no matter which timezone the test runner uses.
    expect(formatDate('2026-06-30T10:00:00')).toBe('30.06.2026, 10:00')
  })
})
