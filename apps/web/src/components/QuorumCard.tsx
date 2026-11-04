import { CheckCircle2, Clock, XCircle } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ApiQuorumRow } from '@/lib/types'
import { cn } from '@/lib/utils'

const STATE_ICON = {
  approved: CheckCircle2,
  rejected: XCircle,
  pending: Clock,
} as const

const STATE_CLASS = {
  approved: 'text-success',
  rejected: 'text-destructive',
  pending: 'text-muted-foreground',
} as const

export function QuorumCard({ quorum }: { quorum: ApiQuorumRow[] }) {
  const approved = quorum.filter((q) => q.state === 'approved').length
  const pct = quorum.length > 0 ? Math.round((approved / quorum.length) * 100) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Decision Quorum</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2">
          {quorum.map((vote) => {
            const state = (vote.state in STATE_ICON ? vote.state : 'pending') as keyof typeof STATE_ICON
            const Icon = STATE_ICON[state]
            return (
              <li key={vote.role} className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium">{vote.role}</span>
                <span className={cn('flex items-center gap-1.5 text-xs font-semibold capitalize', STATE_CLASS[state])}>
                  <Icon className="size-4" aria-hidden="true" />
                  {state}
                </span>
              </li>
            )
          })}
        </ul>
      </CardContent>
      <CardContent className="flex items-center justify-between border-t pt-4 text-sm">
        <span className="text-muted-foreground">Completion</span>
        <span className="font-mono font-semibold tabular-nums">{pct}%</span>
      </CardContent>
    </Card>
  )
}
