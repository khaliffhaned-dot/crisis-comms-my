import type { Incident, AuditEntry } from './types'
import { newIncident } from './types'

const LS_KEY = 'escalate-my-core-v1'

function apiBase(): string {
  return (import.meta as any).env?.VITE_INCIDENT_API_BASE || (import.meta as any).env?.VITE_API_BASE || ''
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

function normalizeIncident(value: unknown): Incident {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw remoteError('Unexpected incident payload from backend.')
  }
  const data = value as Record<string, unknown>
  if (typeof data.id !== 'string' || typeof data.title !== 'string') {
    throw remoteError('Incident response is missing an id or title.')
  }
  // New API responses return the complete frontend model.
  if (Array.isArray(data.checked) && Array.isArray(data.audit) && typeof data.createdAt === 'string') {
    return data as unknown as Incident
  }
  // Preserve compatibility with records created before the client payload migration.
  const severityText = typeof data.severity === 'string' ? data.severity : ''
  const severityNumber = Number(severityText.replace(/^L/i, ''))
  const status = data.status === 'CLOSED' || data.status === 'closed' ? 'closed' : 'open'
  return newIncident({
    id: data.id,
    title: data.title,
    description: typeof data.description === 'string' ? data.description : undefined,
    severity: [1, 2, 3, 4].includes(severityNumber) ? (severityNumber as Incident['severity']) : null,
    status,
    createdAt: typeof data.created_at === 'string' ? data.created_at : undefined,
    updatedAt: typeof data.updated_at === 'string' ? data.updated_at : undefined,
  })
}

async function requestJson(path: string, init?: RequestInit): Promise<unknown> {
  const base = apiBase()
  if (!base) throw remoteError('No incident API backend configured.')
  const response = await fetch(`${base.replace(/\/$/, '')}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
    cache: 'no-store',
  })
  if (!response.ok) {
    throw remoteError(`Incident API request failed (${response.status}) for ${path}`)
  }
  return response.json()
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
    const payload = await requestJson('/api/incidents')
    const results = Array.isArray(payload)
      ? payload
      : payload && typeof payload === 'object' && Array.isArray((payload as { incidents?: unknown }).incidents)
        ? (payload as { incidents: unknown[] }).incidents
        : null
    if (!results) throw remoteError('Unexpected incident list response from backend.')
    return results.map(normalizeIncident)
  }

  let list = loadLocal()
  if (!list.length) {
    list = [newIncident({ title: 'Demo · market speculation', severity: 2, scenario: 'market', status: 'open' })]
    saveLocal(list)
  }
  return list
}

export async function getIncident(id: string): Promise<Incident | null> {
  const list = await listIncidents()
  return list.find((incident) => incident.id === id) || null
}

export async function saveIncident(incident: Incident): Promise<Incident> {
  const base = apiBase()
  if (base) {
    const payload = await requestJson(`/api/incidents/${encodeURIComponent(incident.id)}`, {
      method: 'PUT',
      body: JSON.stringify(incident),
    })
    if (!payload || typeof payload !== 'object' || !('incident' in payload)) {
      throw remoteError('Unexpected incident save response from backend.')
    }
    return normalizeIncident((payload as { incident: unknown }).incident)
  }

  const list = loadLocal()
  const index = list.findIndex((item) => item.id === incident.id)
  if (index >= 0) list[index] = incident
  else list.unshift(incident)
  saveLocal(list)
  return incident
}

export async function createIncident(title: string, actor = 'Operator'): Promise<Incident> {
  const incident = appendAudit(newIncident({ title }), actor, 'Incident created', title)
  return saveIncident(incident)
}

export function backendMode(): 'api' | 'war-room' | 'local' {
  if (apiBase()) return 'api'
  if (wsBase()) return 'war-room'
  return 'local'
}

export { wsBase, apiBase }
