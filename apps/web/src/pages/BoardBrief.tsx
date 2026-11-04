import { ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

import { BoardBriefCard } from '@/components/BoardBriefCard'
import { EmptyState, ErrorState, LoadingState } from '@/components/StateView'
import { useIncident } from '@/lib/useIncident'

/**
 * Screen 3 — BoardBrief.
 * Purpose: turn live crisis data into executive reporting.
 */
export function BoardBrief({ onActiveIncident }: { onActiveIncident: (id: string | null) => void }) {
  const { loading, error, payload, refresh } = useIncident()

  useEffect(() => {
    onActiveIncident(payload?.incident.id ?? null)
  }, [payload, onActiveIncident])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={refresh} />
  if (!payload) {
    return <EmptyState title="Nothing to brief" body="There's no active incident to generate a board brief for." />
  }

  return (
    <div className="flex flex-col gap-5">
      <Link to="/" className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1.5 text-sm print:hidden">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Command Centre
      </Link>
      <BoardBriefCard payload={payload} incidentId={payload.incident.id} />
    </div>
  )
}
