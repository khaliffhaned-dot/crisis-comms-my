/**
 * Backend client for Escalate MY Core.
 * Prefers war-room Worker (VITE_WAR_ROOM_WS / VITE_API_BASE).
 * Falls back to localStorage when offline.
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

export async function listIncidents(): Promise<Incident[]> {
  const base = apiBase()
  if (base) {
    try {
      const res = await fetch(`${base.replace(/\/$/, '')}/incidents`)
      if (res.ok) return (await res.json()) as Incident[]
    } catch {
      /* fall through */
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
    try {
      const res = await fetch(`${base.replace(/\/$/, '')}/incidents/${encodeURIComponent(inc.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inc),
      })
      if (res.ok) return (await res.json()) as Incident
    } catch {
      /* fall through */
    }
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
