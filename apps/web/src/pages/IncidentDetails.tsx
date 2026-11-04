import { ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'

import { ActionBanner } from '@/components/ActionBanner'
import { ChecklistProgress, type ChecklistItem } from '@/components/ChecklistProgress'
import { IncidentTimeline } from '@/components/IncidentTimeline'
import { PresenceIndicator } from '@/components/PresenceIndicator'
import { QuorumCard } from '@/components/QuorumCard'
import { RegulatoryClock } from '@/components/RegulatoryClock'
import { SeverityBadge } from '@/components/SeverityBadge'
import { EmptyState, ErrorState, LoadingState } from '@/components/StateView'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { updateTaskStatus } from '@/lib/api'
import { relativeTime } from '@/lib/format'
import { UI_CLOCKS } from '@/lib/uiClocks'
import { useIncident } from '@/lib/useIncident'

/**
 * Screen 2 — Incident Detail.
 * Purpose: answer "what happened?", "how serious is it?", "what's left?"
 */
export function IncidentDetails({ onActiveIncident }: { onActiveIncident: (id: string | null) => void }) {
  const { id } = useParams<{ id: string }>()
  const { loading, error, payload, refresh, presence } = useIncident(id)

  useEffect(() => {
    onActiveIncident(payload?.incident.id ?? id ?? null)
  }, [payload, id, onActiveIncident])

  // Honor #actions / #regulatory deep links from the 5-tab nav.
  useEffect(() => {
    if (loading || !window.location.hash) return
    const el = document.querySelector(window.location.hash)
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [loading])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={refresh} />
  if (!payload) {
    return <EmptyState title="Incident not found" body="This incident doesn't exist, or hasn't been created yet." />
  }

  const { incident, tasks, quorum, audit, clocks } = payload

  async function handleToggle(item: ChecklistItem) {
    const next = item.status === 'done' ? 'pending' : 'done'
    await updateTaskStatus(incident.id, item.id, next)
    refresh()
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <Link to="/" className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1.5 text-sm">
          <ArrowLeft className="size-4" aria-hidden="true" />
          {incident.title}
        </Link>
        <PresenceIndicator presence={presence} />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <SeverityBadge severity={incident.severity} />
        <Badge variant={incident.status === 'open' ? 'default' : 'secondary'} className="uppercase">
          {incident.status}
        </Badge>
      </div>

      <ActionBanner quorum={quorum} tasks={tasks} />

      <Card>
        <CardHeader>
          <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {incident.statement || 'No holding statement on file yet.'}
          </p>
        </CardContent>
      </Card>

      <Card id="actions">
        <CardHeader>
          <CardTitle>60 Minute Response</CardTitle>
        </CardHeader>
        <CardContent>
          <ChecklistProgress
            items={tasks.map((t) => ({ id: t.id, title: t.title, status: t.status }))}
            onToggle={handleToggle}
          />
        </CardContent>
      </Card>

      <QuorumCard quorum={quorum} />

      <div id="regulatory">
        <RegulatoryClock clocks={clocks} clockIds={UI_CLOCKS.map((c) => c.id)} />
      </div>

      <Card>
        <CardContent className="flex items-center justify-between text-sm">
          <div>
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Owner</p>
            <p className="font-medium">{incident.owner || 'Unassigned'}</p>
          </div>
          <div className="text-right">
            <p className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Updated</p>
            <p className="font-medium">{relativeTime(incident.updated_at)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
        </CardHeader>
        <CardContent>
          <IncidentTimeline entries={audit} />
        </CardContent>
      </Card>
    </div>
  )
}
