import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

const LABEL_CLASS: Record<string, string> = {
  GOOD: 'bg-success text-success-foreground border-transparent',
  WATCH: 'bg-warning text-warning-foreground border-transparent',
  'AT RISK': 'bg-destructive text-white border-transparent',
}

const INDICATOR_CLASS: Record<string, string> = {
  GOOD: 'bg-success',
  WATCH: 'bg-warning',
  'AT RISK': 'bg-destructive',
}

export function ReadinessCard({ pct, label }: { pct: number; label: 'GOOD' | 'WATCH' | 'AT RISK' }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
          Operational Readiness
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-4xl font-bold tabular-nums">{pct}</span>
          <span className="text-muted-foreground font-mono text-xl font-bold">%</span>
        </div>
        <Badge className={cn('px-2.5 py-1 text-[11px] tracking-wide', LABEL_CLASS[label])}>{label}</Badge>
      </CardContent>
      <CardContent>
        <Progress value={pct} indicatorClassName={INDICATOR_CLASS[label]} aria-label="Operational readiness" />
      </CardContent>
    </Card>
  )
}
