import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

import { cn } from '@/lib/utils'
import { TableHead } from '@/components/ui/table'
import type { SortDirection } from '@/hooks/useTableControls'

interface SortableTableHeadProps extends Omit<React.ComponentProps<'th'>, 'align'> {
  sortKey: string
  activeKey: string | null
  direction: SortDirection
  onSort: (key: string) => void
  align?: 'start' | 'center' | 'end'
}

const alignClass = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
} as const

export function SortableTableHead({
  sortKey,
  activeKey,
  direction,
  onSort,
  align = 'start',
  className,
  children,
  ...props
}: SortableTableHeadProps) {
  const isActive = activeKey === sortKey
  const Icon = !isActive ? ArrowUpDown : direction === 'asc' ? ArrowUp : ArrowDown

  return (
    <TableHead
      aria-sort={isActive ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
      className={cn('p-0', className)}
      {...props}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={cn(
          'flex h-10 w-full items-center gap-1 px-2 font-medium hover:text-foreground',
          alignClass[align],
        )}
      >
        {children}
        <Icon
          className={cn('size-3.5', isActive ? 'text-foreground' : 'text-muted-foreground/50')}
        />
      </button>
    </TableHead>
  )
}
