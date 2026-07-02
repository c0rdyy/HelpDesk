import { describe, expect, it } from 'vitest'

import { buildPageItems } from './pagination'

describe('buildPageItems', () => {
  it('returns every page when the total fits without ellipsis', () => {
    expect(buildPageItems(1, 5)).toEqual([1, 2, 3, 4, 5])
  })

  it('returns a single page for a one-page list', () => {
    expect(buildPageItems(1, 1)).toEqual([1])
  })

  it('adds an ellipsis between the first page and the current neighborhood', () => {
    expect(buildPageItems(10, 20)).toEqual([
      1,
      'ellipsis',
      9,
      10,
      11,
      'ellipsis',
      20
    ])
  })

  it('does not add an ellipsis when near the start', () => {
    expect(buildPageItems(2, 20)).toEqual([1, 2, 3, 'ellipsis', 20])
  })

  it('does not add an ellipsis when near the end', () => {
    expect(buildPageItems(19, 20)).toEqual([1, 'ellipsis', 18, 19, 20])
  })
})
