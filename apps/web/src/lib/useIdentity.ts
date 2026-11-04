import { useEffect, useState } from 'react'
import { getMe } from './api'
import type { Identity } from './types'

const FALLBACK: Identity = { actor: null, email: null, verified: false }

// Module-level cache: the caller's identity doesn't change mid-session, and
// every page that needs it (IncidentDetails, BoardBriefCard, …) would
// otherwise each fire their own GET /api/v1/me on mount.
let cached: Identity | null = null
let inflight: Promise<Identity> | null = null

/**
 * Who Cloudflare Access says the current user is, resolved once and shared
 * across the app. Falls back to the generic 'Operator' label whenever Access
 * isn't enabled on the API route yet (local dev without an `access.dev`
 * block, or the dashboard toggle not flipped) — the same default this app
 * used everywhere before user identification existed.
 */
export function useCurrentActor(): string {
  const [identity, setIdentity] = useState<Identity>(cached ?? FALLBACK)

  useEffect(() => {
    if (cached) return
    if (!inflight) inflight = getMe().catch(() => FALLBACK)
    let active = true
    inflight.then((resolved) => {
      cached = resolved
      if (active) setIdentity(resolved)
    })
    return () => {
      active = false
    }
  }, [])

  return identity.actor || 'Operator'
}
