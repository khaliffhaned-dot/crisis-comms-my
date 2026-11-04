import { cn } from '@/lib/utils'

/**
 * A row of N equal pill segments, `completed` of them filled. An alternative
 * to the continuous Progress bar for small, countable totals (quorum roles,
 * a 13-step checklist) where "how many of how many" reads faster as discrete
 * segments than as a percentage-filled bar.
 */
export function SegmentedProgress({
  total,
  completed,
  className,
  indicatorClassName,
}: {
  total: number
  completed: number
  className?: string
  indicatorClassName?: string
}) {
  return (
    <div
      className={cn('flex gap-1', className)}
      role="progressbar"
      aria-valuenow={completed}
      aria-valuemin={0}
      aria-valuemax={total}
    >
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1.5 flex-1 rounded-full',
            i < completed ? cn('bg-primary', indicatorClassName) : 'bg-muted'
          )}
        />
      ))}
    </div>
  )
}
