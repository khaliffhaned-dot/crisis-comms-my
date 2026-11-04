import { useCallback, useEffect, useState } from 'react'

import { getIncidentFull, liveIncidentUrl, listIncidents } from './api'
import type { FullIncidentPayload, PresenceEntry } from './types'
import { useCurrentActor } from './useIdentity'

interface IncidentState {
  loading: boolean
  error: string | null
  payload: FullIncidentPayload | null
  refresh: () => void
  /** Who else is currently viewing this incident — empty while the live
   * connection is still opening, or if it never connects (degrades
   * silently: the page still works via the normal fetch above, it just
   * won't live-update without a manual refresh). */
  presence: PresenceEntry[]
}

/**
 * Loads one real incident from escalate-my-api — the most recently created
 * for the organisation when no id is given (the "active incident" these
 * sales-prototype screens are built around), or a specific id. No sample
 * data: an org with zero incidents yet surfaces as a real empty state, not
 * a fabricated placeholder.
 *
 * Also opens a live WebSocket (IncidentRoom DO — see WAR-ROOM.md) once the
 * real incident id is known, for presence and "something changed" pushes.
 * D1 (via getIncidentFull) stays the only source of the actual data; the
 * socket only tells this hook *when* to refetch it, same as `refresh()`
 * already does after this tab's own writes.
 */
export function useIncident(incidentId?: string): IncidentState {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [payload, setPayload] = useState<FullIncidentPayload | null>(null)
  const [presence, setPresence] = useState<PresenceEntry[]>([])
  const [tick, setTick] = useState(0)
  const actor = useCurrentActor()

  // Stable identity (empty deps) — safe to use directly inside the live
  // WebSocket effect below without forcing it to reconnect on every render.
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

  // Live connection — only once the real id is resolved (payload.incident.id),
  // not on `incidentId` directly (that prop may be undefined and get
  // resolved internally above).
  const resolvedId = payload?.incident.id ?? null
  useEffect(() => {
    if (!resolvedId) {
      setPresence([])
      return
    }

    let closed = false
    let ws: WebSocket | null = null
    let reconnectAttempt = 0
    let reconnectTimer: number | undefined

    function connect() {
      if (closed || !resolvedId) return
      ws = new WebSocket(liveIncidentUrl(resolvedId, actor))

      ws.onopen = () => {
        reconnectAttempt = 0
      }
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data)
          if (msg.type === 'presence') setPresence(msg.presence ?? [])
          else if (msg.type === 'incident_updated') refresh()
        } catch {
          /* ignore malformed frame */
        }
      }
      ws.onclose = () => {
        if (closed) return
        setPresence([])
        const delay = Math.min(10_000, 500 * 2 ** reconnectAttempt++)
        reconnectTimer = window.setTimeout(connect, delay)
      }
      ws.onerror = () => {
        try {
          ws?.close()
        } catch {
          /* ignore */
        }
      }
    }

    connect()

    return () => {
      closed = true
      if (reconnectTimer) window.clearTimeout(reconnectTimer)
      try {
        ws?.close()
      } catch {
        /* ignore */
      }
    }
  }, [resolvedId, refresh, actor])

  return { loading, error, payload, refresh, presence }
}
