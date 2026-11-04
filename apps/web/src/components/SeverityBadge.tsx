import { AlertTriangle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { severityMeta } from '@/lib/format'
import { cn } from '@/lib/utils'

const TONE_CLASS: Record<string, string> = {
  l1: 'bg-severity-l1 text-severity-l1-foreground',
  l2: 'bg-severity-l2 text-severity-l2-foreground',
  l3: 'bg-severity-l3 text-severity-l3-foreground',
  l4: 'bg-severity-l4 text-severity-l4-foreground',
}

/** Severity is never color-only: the badge always pairs the level number,
 * a name, and — at L3+ — an icon, per .ux-profile.md's status-vocabulary
 * rule (color + shape + label together). */
export function SeverityBadge({ severity, className }: { severity: number | null; className?: string }) {
  const meta = severityMeta(severity)
  if (!meta) {
    return (
      <Badge variant="outline" className={className}>
        Not set
      </Badge>
    )
  }
  return (
    <Badge className={cn(TONE_CLASS[meta.tone], 'border-transparent', className)}>
      {meta.level >= 3 && <AlertTriangle aria-hidden="true" />}
      L{meta.level} {meta.name}
    </Badge>
  )
}
