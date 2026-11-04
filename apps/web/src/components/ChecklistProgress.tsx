import { Check, Circle, Clock } from 'lucide-react'

import { SegmentedProgress } from '@/components/ui/segmented-progress'
import { cn } from '@/lib/utils'

export interface ChecklistItem {
  id: string
  title: string
  status: 'done' | 'overdue' | 'pending' | string
}

/** Shared 60-minute-response checklist renderer. `compact` drops per-item
 * rows (used on the Command Centre summary) and shows only the progress
 * line + bar; the full list (IncidentDetails) shows every step with its
 * state icon. Never color-only: each state also has a distinct icon. */
export function ChecklistProgress({
  items,
  compact = false,
  onToggle,
}: {
  items: ChecklistItem[]
  compact?: boolean
  onToggle?: (item: ChecklistItem) => void
}) {
  const done = items.filter((i) => i.status === 'done').length
  const pct = items.length > 0 ? Math.round((done / items.length) * 100) : 0

  return (
    <div className="flex flex-col gap-3">
      {!compact && (
        <ul className="flex flex-col gap-2.5">
          {items.map((item) => {
            const isDone = item.status === 'done'
            const isOverdue = item.status === 'overdue'
            const Icon = isDone ? Check : isOverdue ? Clock : Circle
            return (
              <li key={item.id}>
                <button
                  type="button"
                  disabled={!onToggle}
                  onClick={() => onToggle?.(item)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-md py-1 text-left text-sm',
                    onToggle && 'hover:bg-accent/50 -mx-1 px-1 transition-colors'
                  )}
                >
                  <span
                    className={cn(
                      'flex size-5 shrink-0 items-center justify-center rounded-full border',
                      isDone && 'bg-success border-success text-success-foreground',
                      isOverdue && 'bg-destructive border-destructive text-white',
                      !isDone && !isOverdue && 'border-muted-foreground/40 text-transparent'
                    )}
                  >
                    <Icon className="size-3.5" aria-hidden="true" />
                  </span>
                  <span className={cn(isDone && 'text-muted-foreground line-through')}>{item.title}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
      <div className="flex items-center gap-3">
        <SegmentedProgress total={items.length} completed={done} className="flex-1" />
        <span className="font-mono text-muted-foreground shrink-0 text-xs font-semibold tabular-nums">{pct}%</span>
      </div>
    </div>
  )
}
