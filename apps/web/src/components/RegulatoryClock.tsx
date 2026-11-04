import { CheckCircle2, CircleDashed } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { COMMAND_CENTRE_CLOCK_IDS, UI_CLOCKS } from '@/lib/uiClocks'
import { cn } from '@/lib/utils'

/** `clocks` is live state from FullIncidentPayload — true once a clock has
 * been started (tracked in incident_obligations), never a fabricated
 * tri-state. `clockIds` scopes which rows to show (Command Centre shows 3;
 * pass undefined for the full 7-clock set). */
export function RegulatoryClock({ clocks, clockIds }: { clocks: Record<string, boolean>; clockIds?: string[] }) {
  const ids = clockIds ?? COMMAND_CENTRE_CLOCK_IDS
  const rows = UI_CLOCKS.filter((c) => ids.includes(c.id))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Regulatory Clock</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="flex flex-col gap-2.5">
          {rows.map((clock) => {
            const started = Boolean(clocks[clock.id])
            return (
              <li key={clock.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="flex min-w-0 flex-col">
                  <span className="font-medium">{clock.regulator}</span>
                  <span className="text-muted-foreground truncate text-xs">{clock.label}</span>
                </div>
                <span
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 text-xs font-semibold',
                    started ? 'text-success' : 'text-muted-foreground'
                  )}
                >
                  {started ? (
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                  ) : (
                    <CircleDashed className="size-4" aria-hidden="true" />
                  )}
                  {started ? 'Started' : 'Not started'}
                </span>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
