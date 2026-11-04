import { useCallback, useEffect, useState } from 'react'

import { getIncidentFull, listIncidents } from './api'
import type { FullIncidentPayload } from './types'

interface IncidentState {
  loading: boolean
  error: string | null
  payload: FullIncidentPayload | null
  refresh: () => void
}

/**
 * Loads one real incident from escalate-my-api — the most recently created
 * for the organisation when no id is given (the "active incident" these
 * sales-prototype screens are built around), or a specific id. No sample
 * data: an org with zero incidents yet surfaces as a real empty state, not
 * a fabricated placeholder.
 */
export function useIncident(incidentId?: string): IncidentState {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [payload, setPayload] = useState<FullIncidentPayload | null>(null)
  const [tick, setTick] = useState(0)

  const refresh = useCallback(() => setTick((t) => t + 1), [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    async function load() {
      try {
        const id = incidentId ?? (await listIncidents())[0]?.id
        if (!id) {
          if (!cancelled) {
            setPayload(null)
            setLoading(false)
          }
          return
        }
        const full = await getIncidentFull(id)
        if (!cancelled) {
          setPayload(full)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Could not reach escalate-my-api.')
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [incidentId, tick])

  return { loading, error, payload, refresh }
}
