export type PageItem = number | 'ellipsis'

export function buildPageItems(current: number, total: number): PageItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const pages = new Set([1, total, current, current - 1, current + 1])
  const normalized = Array.from(pages)
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b)

  return normalized.reduce<PageItem[]>((items, page, index) => {
    const previous = normalized[index - 1]

    if (previous && page - previous > 1) {
      items.push('ellipsis')
    }

    items.push(page)
    return items
  }, [])
}
