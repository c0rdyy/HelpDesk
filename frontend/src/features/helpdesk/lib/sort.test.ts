import { describe, expect, it } from 'vitest'

import { sortToParams } from './sort'

describe('sortToParams', () => {
  it('maps "created_desc" to sorting by creation date, newest first', () => {
    expect(sortToParams('created_desc')).toEqual({
      sort_by: 'created_at',
      sort_order: 'desc'
    })
  })

  it('maps "created_asc" to sorting by creation date, oldest first', () => {
    expect(sortToParams('created_asc')).toEqual({
      sort_by: 'created_at',
      sort_order: 'asc'
    })
  })

  it('maps "priority_desc" to sorting by priority, highest first', () => {
    expect(sortToParams('priority_desc')).toEqual({
      sort_by: 'priority',
      sort_order: 'desc'
    })
  })

  it('maps "priority_asc" to sorting by priority, lowest first', () => {
    expect(sortToParams('priority_asc')).toEqual({
      sort_by: 'priority',
      sort_order: 'asc'
    })
  })
})
