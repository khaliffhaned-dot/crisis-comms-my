import { CheckCircle2, CircleDashed, XCircle } from 'lucide-react'

import { SegmentedProgress } from '@/components/ui/segmented-progress'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { relativeTime } from '@/lib/format'
import type { ApiQuorumRow } from '@/lib/types'
import { cn } from '@/lib/utils'

const STATE_ICON = {
  approved: CheckCircle2,
  rejected: XCircle,
  pending: CircleDashed,
} as const

const STATE_CLASS = {
  approved: 'text-success',
  rejected: 'text-destructive',
  pending: 'text-warning',
} as const

export function QuorumCard({ quorum }: { quorum: ApiQuorumRow[] }) {
  const approved = quorum.filter((q) => q.state === 'approved').length
  const pct = quorum.length > 0 ? Math.round((approved / quorum.length) * 100) : 0

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Decision Quorum</CardTitle>
        <span className="font-mono text-xs font-semibold tabular-nums">{pct}%</span>
      </CardHeader>
      <CardContent>
        <SegmentedProgress total={quorum.length} completed={approved} className="mb-4" />
        <ul className="flex flex-col gap-3">
          {quorum.map((vote) => {
            const state = (vote.state in STATE_ICON ? vote.state : 'pending') as keyof typeof STATE_ICON
            const Icon = STATE_ICON[state]
            return (
              <li key={vote.role} className="grid grid-cols-[1fr_auto_auto] items-center gap-x-4 text-sm">
                <span className={cn('font-medium', state === 'pending' && 'text-warning')}>{vote.role}</span>
                <span className="text-muted-foreground font-mono text-xs">
                  {state === 'pending' ? 'Pending' : vote.responded_at ? relativeTime(vote.responded_at) : '—'}
                </span>
                <Icon className={cn('size-4 shrink-0', STATE_CLASS[state])} aria-hidden="true" />
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
