import { AlertTriangle } from 'lucide-react'

import type { ApiQuorumRow, ApiTask } from '@/lib/types'

/**
 * Surfaces what specifically needs a decision right now — pending quorum
 * approvals first (they block external action), then overdue first-60
 * tasks. Renders nothing when nothing is actually blocking: an empty state
 * here is itself the correct, informative answer, not a gap to fill with a
 * generic "all clear" banner.
 */
export function ActionBanner({ quorum, tasks }: { quorum: ApiQuorumRow[]; tasks: ApiTask[] }) {
  const pendingVotes = quorum.filter((q) => q.state === 'pending')
  const overdueTasks = tasks.filter((t) => t.status === 'overdue')

  let title: string | null = null
  let subtitle = ''

  if (pendingVotes.length > 0) {
    title = `${pendingVotes.length} approval${pendingVotes.length === 1 ? '' : 's'} pending`
    subtitle = `Waiting on ${pendingVotes.map((v) => v.role).join(', ')} before quorum is reached.`
  } else if (overdueTasks.length > 0) {
    title = `${overdueTasks.length} step${overdueTasks.length === 1 ? '' : 's'} overdue`
    subtitle = `${overdueTasks[0].title}${overdueTasks.length > 1 ? `, and ${overdueTasks.length - 1} more` : ''} — past the 60-minute window.`
  }

  if (!title) return null

  return (
    <div className="bg-warning/15 border-warning/40 flex items-start gap-3 rounded-lg border p-3">
      <span className="relative mt-0.5 flex size-4 shrink-0 items-center justify-center" aria-hidden="true">
        <span className="bg-warning absolute inline-flex size-full animate-ping rounded-full opacity-60" />
        <span className="bg-warning relative inline-flex size-2 rounded-full" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold tracking-tight">{title}</p>
        <p className="text-muted-foreground mt-0.5 text-xs leading-snug font-medium">{subtitle}</p>
      </div>
      <AlertTriangle className="text-warning ml-auto size-4 shrink-0" aria-hidden="true" />
    </div>
  )
}
