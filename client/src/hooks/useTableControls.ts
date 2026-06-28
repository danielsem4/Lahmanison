import { useMemo, useState } from 'react'

export type SortDirection = 'asc' | 'desc'

type SortValue = string | number | null | undefined

interface Options<T> {
  /** Text used for case-insensitive substring matching. */
  searchText: (row: T) => string
  /** Per-sort-key value accessors; keys match the sortable column headers. */
  sortAccessors: Record<string, (row: T) => SortValue>
  initialSort?: { key: string; direction: SortDirection }
}

interface TableControls<T> {
  search: string
  setSearch: (value: string) => void
  sortKey: string | null
  sortDirection: SortDirection
  toggleSort: (key: string) => void
  rows: T[]
}

function compare(a: SortValue, b: SortValue): number {
  // Nulls sort last regardless of direction.
  const aEmpty = a === null || a === undefined || a === ''
  const bEmpty = b === null || b === undefined || b === ''
  if (aEmpty && bEmpty) return 0
  if (aEmpty) return 1
  if (bEmpty) return -1

  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b))
}

export function useTableControls<T>(
  data: T[] | undefined,
  { searchText, sortAccessors, initialSort }: Options<T>,
): TableControls<T> {
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(initialSort?.key ?? null)
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    initialSort?.direction ?? 'asc',
  )

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const rows = useMemo(() => {
    let result = data ?? []

    const query = search.trim().toLowerCase()
    if (query) {
      result = result.filter((row) => searchText(row).toLowerCase().includes(query))
    }

    if (sortKey) {
      const accessor = sortAccessors[sortKey]
      if (accessor) {
        const factor = sortDirection === 'asc' ? 1 : -1
        result = [...result].sort((a, b) => compare(accessor(a), accessor(b)) * factor)
      }
    }

    return result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, search, sortKey, sortDirection])

  return { search, setSearch, sortKey, sortDirection, toggleSort, rows }
}
