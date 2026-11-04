import { ScrollArea } from '@/components/ui/scroll-area'
import type { ApiAuditRow } from '@/lib/types'
import { relativeTime } from '@/lib/format'

/** Renders the real audit trail (audit_log rows) as a timeline — not a
 * separate invented activity feed. Same data IncidentDetails' "Updated Xm
 * ago" line and the Audit Trail module elsewhere in the app both read from. */
export function IncidentTimeline({ entries }: { entries: ApiAuditRow[] }) {
  if (entries.length === 0) {
    return <p className="text-muted-foreground text-sm">No activity recorded yet.</p>
  }

  return (
    <ScrollArea className="h-48">
      <ol className="flex flex-col gap-3 pr-3">
        {entries.map((entry) => (
          <li key={entry.id} className="flex gap-3 text-sm">
            <span className="bg-border mt-1.5 size-1.5 shrink-0 rounded-full" aria-hidden="true" />
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="leading-snug">
                <span className="font-medium">{entry.actor}</span>{' '}
                <span className="text-muted-foreground">{entry.action.replace(/_/g, ' ')}</span>
              </p>
              {entry.detail && <p className="text-muted-foreground truncate text-xs">{entry.detail}</p>}
              <p className="text-muted-foreground font-mono text-[11px]">{relativeTime(entry.created_at)}</p>
            </div>
          </li>
        ))}
      </ol>
    </ScrollArea>
  )
}
