import type { Incident, AuditEntry, QuorumVote, QuorumRole, Lang, Severity, IncidentStatus } from './types'
import { newIncident, DEFAULT_QUORUM } from './types'

const LS_KEY = 'escalate-my-core-v1'
const PROD_API = 'https://escalate-my-api.khaliffhaned.workers.dev'
const DEFAULT_ORG_ID = 'org_default'

function env(key: string): string {
  return ((import.meta as any).env?.[key] as string | undefined) || ''
}

/** Set VITE_LOCAL_ONLY=true to force the pure browser-storage demo mode (no network). */
function isLocalOnly(): boolean {
  return env('VITE_LOCAL_ONLY') === 'true'
}

/**
 * Escalate MY is Cloudflare-backed by default: the real incident API
 * (escalate-my-api — Workers + D1 + KV + R2) is used out of the box,
 * same as the Decision Intelligence client already does. Local mode is an
 * explicit opt-out (VITE_LOCAL_ONLY=true), not the default.
 */
function apiBase(): string {
  if (isLocalOnly()) return ''
  const fromEnv = (env('VITE_INCIDENT_API_BASE') || env('VITE_API_BASE')).replace(/\/$/, '')
  return fromEnv || PROD_API
}

function wsBase(): string {
  return env('VITE_WAR_ROOM_WS')
}

function orgId(): string {
  return env('VITE_ORGANISATION_ID') || DEFAULT_ORG_ID
}

function apiToken(): string {
  return env('VITE_API_TOKEN')
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

async function requestJson(path: string, init?: RequestInit): Promise<unknown> {
  const base = apiBase()
  if (!base) throw remoteError('No incident API backend configured.')
  const headers: Record<string, string> = {}
  if (init?.body) headers['Content-Type'] = 'application/json'
  const token = apiToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  const response = await fetch(`${base}${path}`, {
    ...init,
    headers: { ...headers, ...init?.headers },
    cache: 'no-store',
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw remoteError(`Incident API request failed (${response.status}) for ${path}${text ? `: ${text}` : ''}`)
  }
  return response.json()
}

// --- backend <-> local shape mapping -------------------------------------
// The backend normalizes incidents/tasks/quorum_responses/audit_log into
// separate D1 tables; the frontend has always worked with one flattened
// Incident blob. GET /api/v1/incidents/:id/full returns the composite, and
// everything below assembles it into the shape the UI already expects —
// so CommandCentre, First60Module, QuorumModule, ClocksModule and
// AuditModule need no changes at all.

interface BackendTask {
  id: string
  step_index: number | null
  status: string
}
interface BackendQuorumRow {
  role: string
  respondent_name: string | null
  state: string
  note: string | null
  responded_at: string | null
}
interface BackendAuditRow {
  id: string
  actor: string
  action: string
  detail: string | null
  created_at: string
}
interface BackendIncident {
  id: string
  title: string
  status: string
  severity: number | null
  dimension: string | null
  scenario: string
  owner: string | null
  statement: string
  statement_lang: string
  created_at: string
  updated_at: string
}
interface FullIncidentPayload {
  incident: BackendIncident
  tasks: BackendTask[]
  quorum: BackendQuorumRow[]
  audit: BackendAuditRow[]
  clocks: Record<string, boolean>
}

function checkedFromTasks(tasks: BackendTask[]): boolean[] {
  const arr = Array(13).fill(false)
  for (const t of tasks) {
    if (t.step_index && t.step_index >= 1 && t.step_index <= 13) arr[t.step_index - 1] = t.status === 'done'
  }
  return arr
}

function quorumFromApi(rows: BackendQuorumRow[]): QuorumVote[] {
  const merged = DEFAULT_QUORUM.map((q) => ({ ...q }))
  for (const row of rows) {
    const vote: QuorumVote = {
      role: row.role as QuorumRole,
      name: row.respondent_name || undefined,
      state: row.state as QuorumVote['state'],
      at: row.responded_at || undefined,
      note: row.note || undefined,
    }
    const idx = merged.findIndex((q) => q.role === row.role)
    if (idx >= 0) merged[idx] = vote
    else merged.push(vote)
  }
  return merged
}

function auditFromApi(rows: BackendAuditRow[]): AuditEntry[] {
  return rows.map((r) => ({ id: r.id, at: r.created_at, actor: r.actor, action: r.action, detail: r.detail || undefined }))
}

function incidentFromFull(full: FullIncidentPayload): Incident {
  const inc = full.incident
  return {
    id: inc.id,
    title: inc.title,
    status: inc.status as IncidentStatus,
    severity: (inc.severity as Severity | null) ?? null,
    dimension: (inc.dimension as Incident['dimension']) ?? null,
    scenario: inc.scenario,
    owner: inc.owner || '',
    createdAt: inc.created_at,
    updatedAt: inc.updated_at,
    checked: checkedFromTasks(full.tasks),
    clocks: full.clocks || {},
    statement: inc.statement || '',
    statementLang: (inc.statement_lang as Lang) || 'bm',
    quorum: quorumFromApi(full.quorum),
    audit: auditFromApi(full.audit),
  }
}

async function fetchFull(id: string): Promise<Incident> {
  const payload = (await requestJson(`/api/v1/incidents/${encodeURIComponent(id)}/full`)) as FullIncidentPayload
  return incidentFromFull(payload)
}

// --- public API -------------------------------------------------------------

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
    const payload = (await requestJson(`/api/v1/incidents?organisation_id=${encodeURIComponent(orgId())}`)) as {
      items?: Array<{ id: string }>
    }
    const ids = (payload.items ?? []).map((i) => i.id)
    return Promise.all(ids.map((id) => fetchFull(id)))
  }

  let list = loadLocal()
  if (!list.length) {
    list = [newIncident({ title: 'Demo · market speculation', severity: 2, scenario: 'market', status: 'open' })]
    saveLocal(list)
  }
  return list
}

export async function getIncident(id: string): Promise<Incident | null> {
  const base = apiBase()
  if (base) {
    try {
      return await fetchFull(id)
    } catch {
      return null
    }
  }
  const list = loadLocal()
  return list.find((incident) => incident.id === id) || null
}

export async function saveIncident(incident: Incident): Promise<Incident> {
  const base = apiBase()
  if (base) {
    const id = encodeURIComponent(incident.id)

    await requestJson(`/api/v1/incidents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: incident.title,
        status: incident.status,
        severity: incident.severity,
        dimension: incident.dimension,
        scenario: incident.scenario,
        owner: incident.owner,
        statement: incident.statement,
        statement_lang: incident.statementLang,
        actor: 'Operator',
      }),
    })

    const currentTasks = (await requestJson(`/api/v1/incidents/${id}/tasks`)) as { items?: BackendTask[] }
    await Promise.all(
      (currentTasks.items ?? []).map((t) => {
        if (!t.step_index) return Promise.resolve()
        const desired = incident.checked[t.step_index - 1] ? 'done' : 'pending'
        if (desired === t.status) return Promise.resolve()
        return requestJson(`/api/v1/incidents/${id}/tasks/${encodeURIComponent(t.id)}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: desired, actor: 'Operator' }),
        })
      })
    )

    const touchedVotes = incident.quorum.filter((vote) => vote.state !== 'pending' || vote.name || vote.note || vote.at)
    await Promise.all(
      touchedVotes.map((vote) =>
        requestJson(`/api/v1/incidents/${id}/quorum/${encodeURIComponent(vote.role)}`, {
          method: 'PUT',
          body: JSON.stringify({
            state: vote.state,
            note: vote.note ?? null,
            respondent_name: vote.name ?? null,
            actor: vote.name || 'Operator',
          }),
        })
      )
    )

    await Promise.all(
      Object.entries(incident.clocks || {}).map(([clockId, active]) =>
        requestJson(`/api/v1/incidents/${id}/clocks/${encodeURIComponent(clockId)}/toggle`, {
          method: 'POST',
          body: JSON.stringify({ active: Boolean(active), actor: 'Operator' }),
        }).catch(() => undefined)
      )
    )

    return fetchFull(incident.id)
  }

  const list = loadLocal()
  const index = list.findIndex((item) => item.id === incident.id)
  if (index >= 0) list[index] = incident
  else list.unshift(incident)
  saveLocal(list)
  return incident
}

export async function createIncident(title: string, actor = 'Operator'): Promise<Incident> {
  const base = apiBase()
  if (base) {
    const payload = (await requestJson('/api/v1/incidents', {
      method: 'POST',
      body: JSON.stringify({ organisation_id: orgId(), title, actor }),
    })) as { item: { id: string } }
    return fetchFull(payload.item.id)
  }

  const incident = appendAudit(newIncident({ title }), actor, 'Incident created', title)
  return saveIncident(incident)
}

export function backendMode(): 'api' | 'war-room' | 'local' {
  if (apiBase()) return 'api'
  if (wsBase()) return 'war-room'
  return 'local'
}

export interface HoldingStatementResult {
  en?: string
  bm?: string
  disclaimer: string
  source: 'template' | 'workers-ai' | 'local'
}

/**
 * Real backend call (api/apps/api/src/index.ts -> POST /api/v1/holding-statements),
 * which itself AI-drafts via Workers AI when that binding is configured and
 * falls back to its own deterministic template otherwise — see
 * api/packages/incidents/src/holding.ts. Only when no backend is configured
 * at all (VITE_LOCAL_ONLY demo mode) does this fall back to a generic local
 * placeholder, since there is nothing to call.
 */
export async function generateHoldingStatement(opts: {
  scenario: string
  company: string
  issue: string
  lang: 'en' | 'bm' | 'both'
  facts?: string
}): Promise<HoldingStatementResult> {
  if (apiBase()) {
    return (await requestJson('/api/v1/holding-statements', {
      method: 'POST',
      body: JSON.stringify(opts),
    })) as HoldingStatementResult
  }
  const disclaimer = 'Local demo mode — no backend configured. Not a real draft.'
  const line = (lang: 'en' | 'bm') =>
    lang === 'bm'
      ? `${opts.company} sedang menyiasat laporan mengenai ${opts.issue}. Kenyataan lanjut akan dikeluarkan sebaik maklumat disahkan.`
      : `${opts.company} is investigating reports concerning ${opts.issue}. A further statement will follow once information is verified.`
  if (opts.lang === 'en') return { en: line('en'), disclaimer, source: 'local' }
  if (opts.lang === 'bm') return { bm: line('bm'), disclaimer, source: 'local' }
  return { en: line('en'), bm: line('bm'), disclaimer, source: 'local' }
}

export { wsBase, apiBase }
