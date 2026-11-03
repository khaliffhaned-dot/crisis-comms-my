/**
 * Backend client for Escalate MY Core.
 * Prefers war-room Worker (VITE_WAR_ROOM_WS / VITE_API_BASE).
 * Falls back to localStorage only when no remote backend is configured.
 */
import type { Incident, AuditEntry } from './types'
import { newIncident } from './types'

const LS_KEY = 'escalate-my-core-v1'

function apiBase(): string {
  return (import.meta as any).env?.VITE_API_BASE || ''
}

function wsBase(): string {
  return (import.meta as any).env?.VITE_WAR_ROOM_WS || ''
}

function loadLocal(): Incident[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return []
    return JSON.parse(raw) as Incident[]
  } catch {
    return []
  }
}

function saveLocal(list: Incident[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(list))
  } catch {
    /* ignore */
  }
}

function remoteError(message: string): Error {
  return new Error(message)
}

export function appendAudit(inc: Incident, actor: string, action: string, detail?: string): Incident {
  const entry: AuditEntry = {
    id: `AUD-${Date.now()}`,
    at: new Date().toISOString(),
    actor,
    action,
    detail,
  }
  return {
    ...inc,
    updatedAt: entry.at,
    audit: [entry, ...inc.audit].slice(0, 500),
  }
}

async function fetchRemoteJson<T>(path: string): Promise<T> {
  const base = apiBase()
  if (!base) {
    throw remoteError('No API backend configured.')
  }

  const url = `${base.replace(/\/$/, '')}${path}`
  const res = await fetch(url)
  if (!res.ok) {
    throw remoteError(`Backend request failed (${res.status}) for ${path}`)
  }

  return (await res.json()) as T
}

export async function listIncidents(): Promise<Incident[]> {
  const base = apiBase()
  if (base) {
    try {
      const payload = await fetchRemoteJson<Incident[] | { incidents?: Incident[]; results?: Incident[] }>(`/incidents`)
      if (Array.isArray(payload)) return payload
      if (Array.isArray(payload.incidents)) return payload.incidents
      if (Array.isArray(payload.results)) return payload.results
      throw remoteError('Unexpected incident payload shape from backend.')
    } catch (error) {
      throw error instanceof Error ? error : remoteError('Failed to load incidents from backend.')
    }
  }

  let list = loadLocal()
  if (!list.length) {
    list = [
      newIncident({
        title: 'Demo · market speculation',
        severity: 2,
        scenario: 'market',
        status: 'open',
      }),
    ]
    saveLocal(list)
  }
  return list
}

export async function getIncident(id: string): Promise<Incident | null> {
  const list = await listIncidents()
  return list.find((i) => i.id === id) || null
}

export async function saveIncident(inc: Incident): Promise<Incident> {
  const base = apiBase()
  if (base) {
    const url = `${base.replace(/\/$/, '')}/incidents/${encodeURIComponent(inc.id)}`
    const res = await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inc),
    })
    if (!res.ok) {
      throw remoteError(`Backend save failed (${res.status}) for incident ${inc.id}`)
    }
    return (await res.json()) as Incident
  }

  const list = loadLocal()
  const idx = list.findIndex((i) => i.id === inc.id)
  if (idx >= 0) list[idx] = inc
  else list.unshift(inc)
  saveLocal(list)
  return inc
}

export async function createIncident(title: string, actor = 'Operator'): Promise<Incident> {
  let inc = newIncident({ title })
  inc = appendAudit(inc, actor, 'Incident created', title)
  return saveIncident(inc)
}

export function backendMode(): 'api' | 'war-room' | 'local' {
  if (apiBase()) return 'api'
  if (wsBase()) return 'war-room'
  return 'local'
}

export { wsBase, apiBase }
