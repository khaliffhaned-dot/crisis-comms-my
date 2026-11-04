import type { ApiQuorumRow, ApiTask, BoardBriefResult, BriefKind, FullIncidentPayload } from './types'

const PROD_API = 'https://escalate-my-api.khaliffhaned.workers.dev'
const DEFAULT_ORG_ID = 'org_default'

function env(key: string): string {
  return ((import.meta as unknown as { env?: Record<string, string> }).env?.[key] as string | undefined) || ''
}

function apiBase(): string {
  return (env('VITE_API_BASE') || PROD_API).replace(/\/$/, '')
}

function orgId(): string {
  return env('VITE_ORGANISATION_ID') || DEFAULT_ORG_ID
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    cache: 'no-store',
  })
  if (!response.ok) {
    const text = await response.text().catch(() => '')
    throw new Error(`escalate-my-api request failed (${response.status}) for ${path}${text ? `: ${text}` : ''}`)
  }
  return response.json() as Promise<T>
}

/** The single incident this prototype treats as "active" — the most recently
 * updated open incident for the organisation. Real data: no fallback to a
 * fabricated sample incident. An empty state is a real possibility and is
 * handled by the pages, not hidden here. */
export async function listIncidents(): Promise<{ id: string }[]> {
  const payload = await requestJson<{ items?: { id: string }[] }>(
    `/api/v1/incidents?organisation_id=${encodeURIComponent(orgId())}`
  )
  return payload.items ?? []
}

export async function getIncidentFull(id: string): Promise<FullIncidentPayload> {
  return requestJson<FullIncidentPayload>(`/api/v1/incidents/${encodeURIComponent(id)}/full`)
}

export async function updateTaskStatus(incidentId: string, taskId: string, status: ApiTask['status'], actor = 'Operator'): Promise<ApiTask> {
  const result = await requestJson<{ item: ApiTask }>(
    `/api/v1/incidents/${encodeURIComponent(incidentId)}/tasks/${encodeURIComponent(taskId)}`,
    { method: 'PATCH', body: JSON.stringify({ status, actor }) }
  )
  return result.item
}

export async function castQuorumVote(
  incidentId: string,
  role: string,
  state: ApiQuorumRow['state'],
  actor = 'Operator'
): Promise<void> {
  await requestJson(`/api/v1/incidents/${encodeURIComponent(incidentId)}/quorum/${encodeURIComponent(role)}`, {
    method: 'PUT',
    body: JSON.stringify({ state, actor }),
  })
}

export async function generateBoardBrief(incidentId: string, kind: BriefKind, actor = 'Operator'): Promise<BoardBriefResult> {
  return requestJson<BoardBriefResult>('/api/v1/reports/board-brief', {
    method: 'POST',
    body: JSON.stringify({ incident_id: incidentId, kind, actor }),
  })
}

/**
 * Operational Readiness — a derived score, not a stored field (the backend
 * has no such column). Computed from three real, already-live signals so the
 * number on Screen 1 means something instead of being invented for the demo:
 *   - 45%: Decision Quorum completion (approved / total roles)
 *   - 35%: First 60 Minutes checklist completion (done / total tasks)
 *   - 20%: Regulatory clocks on track (tracked clocks that are NOT escalated)
 * Each weight only applies if that signal has data; weights renormalize
 * otherwise (e.g. an incident with no tasks yet doesn't get penalized to 0).
 */
export function readinessScore(payload: FullIncidentPayload): { pct: number; label: 'GOOD' | 'WATCH' | 'AT RISK' } {
  const signals: { weight: number; value: number }[] = []

  if (payload.quorum.length > 0) {
    const approved = payload.quorum.filter((q) => q.state === 'approved').length
    signals.push({ weight: 0.45, value: approved / payload.quorum.length })
  }
  if (payload.tasks.length > 0) {
    const done = payload.tasks.filter((t) => t.status === 'done').length
    signals.push({ weight: 0.35, value: done / payload.tasks.length })
  }
  const clockEntries = Object.entries(payload.clocks)
  if (clockEntries.length > 0) {
    const onTrack = clockEntries.filter(([, active]) => active).length
    signals.push({ weight: 0.2, value: onTrack / clockEntries.length })
  }

  if (signals.length === 0) return { pct: 0, label: 'AT RISK' }
  const totalWeight = signals.reduce((sum, s) => sum + s.weight, 0)
  const score = signals.reduce((sum, s) => sum + (s.weight / totalWeight) * s.value, 0)
  const pct = Math.round(score * 100)
  const label = pct >= 75 ? 'GOOD' : pct >= 45 ? 'WATCH' : 'AT RISK'
  return { pct, label }
}

export function minutesElapsed(createdAt: string): number {
  const ms = Date.now() - new Date(createdAt).getTime()
  return Math.max(0, Math.round(ms / 60000))
}
