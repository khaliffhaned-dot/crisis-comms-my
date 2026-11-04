import { ArrowRight } from 'lucide-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState, ErrorState, LoadingState } from '@/components/StateView'
import { QuorumCard } from '@/components/QuorumCard'
import { ReadinessCard } from '@/components/ReadinessCard'
import { RegulatoryClock } from '@/components/RegulatoryClock'
import { SeverityBadge } from '@/components/SeverityBadge'
import { readinessScore } from '@/lib/api'
import { elapsedMinutes } from '@/lib/format'
import { useIncident } from '@/lib/useIncident'

/**
 * Screen 1 — Crisis Command Centre.
 * Purpose: a CEO opens the app and gets situation awareness in 10 seconds.
 */
export function CommandCentre({ onActiveIncident }: { onActiveIncident: (id: string | null) => void }) {
  const { loading, error, payload, refresh } = useIncident()
  const navigate = useNavigate()

  useEffect(() => {
    onActiveIncident(payload?.incident.id ?? null)
  }, [payload, onActiveIncident])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={refresh} />
  if (!payload) {
    return (
      <EmptyState
        title="No active incident"
        body="Nothing is open for this organisation right now. Command Centre will populate as soon as an incident is created."
      />
    )
  }

  const readiness = readinessScore(payload)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-foreground text-xl font-bold tracking-tight">Crisis Command Centre</h1>
        <p className="text-muted-foreground text-sm">{payload.incident.id}</p>
      </div>

      <ReadinessCard pct={readiness.pct} label={readiness.label} />

      <Card>
        <CardHeader>
          <CardTitle className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
            Active Incident
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          <SeverityBadge severity={payload.incident.severity} className="w-fit" />
          <p className="text-lg font-semibold leading-tight">{payload.incident.title}</p>
          <p className="text-muted-foreground font-mono text-xs">
            {elapsedMinutes(payload.incident.created_at)} mins elapsed
          </p>
        </CardContent>
      </Card>

      <QuorumCard quorum={payload.quorum} />

      <RegulatoryClock clocks={payload.clocks} />

      <Button size="lg" className="gap-1.5" onClick={() => navigate(`/incident/${payload.incident.id}`)}>
        Open Incident
        <ArrowRight className="size-4" aria-hidden="true" />
      </Button>
    </div>
  )
}
