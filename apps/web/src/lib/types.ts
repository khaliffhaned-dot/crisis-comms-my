// Mirrors the real escalate-my-api response shapes (api/apps/api/src/index.ts).
// This prototype reads live data from the same backend the rest of the app
// uses — no mock/sample incidents.

export type IncidentStatus = 'open' | 'monitoring' | 'closed' | string

export interface ApiIncident {
  id: string
  organisation_id?: string
  title: string
  status: IncidentStatus
  severity: number | null
  dimension: string | null
  scenario: string
  owner: string | null
  statement: string
  statement_lang: string
  created_at: string
  updated_at: string
}

export type TaskStatus = 'pending' | 'done' | 'overdue' | string

export interface ApiTask {
  id: string
  incident_id: string
  step_index: number | null
  title: string
  owner: string | null
  status: TaskStatus
  due_band: string | null
  completed_at: string | null
  created_at: string
}

export type QuorumState = 'pending' | 'approved' | 'rejected' | string

export interface ApiQuorumRow {
  id?: string
  incident_id?: string
  role: string
  respondent_name: string | null
  state: QuorumState
  note: string | null
  responded_at: string | null
}

export interface ApiAuditRow {
  id: string
  actor: string
  action: string
  detail: string | null
  created_at: string
}

export interface FullIncidentPayload {
  incident: ApiIncident
  tasks: ApiTask[]
  quorum: ApiQuorumRow[]
  audit: ApiAuditRow[]
  clocks: Record<string, boolean>
}

export interface BoardBriefResult {
  reportId: string
  key: string
  markdown: string
}

export type BriefKind =
  | 'situation_report'
  | 'board_update'
  | 'ceo_brief'
  | 'chairman_brief'
  | 'post_incident_review'

/** One connected operator, from the IncidentRoom Durable Object's presence
 * push (see WAR-ROOM.md) — not persisted anywhere, purely in-memory. */
export interface PresenceEntry {
  id: string
  name: string
  joinedAt: number
}
