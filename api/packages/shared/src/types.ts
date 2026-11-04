export type Edition = 'starter' | 'professional' | 'enterprise' | 'plc'
export type Lang = 'bm' | 'en'
export type Severity = 1 | 2 | 3 | 4
export type IncidentStatus = 'open' | 'monitoring' | 'contained' | 'closed'
export type QuorumState = 'pending' | 'approved' | 'rejected' | 'abstain'
export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'skipped'
export type Dimension = 'Commercial' | 'Policy' | 'National'

export type QuorumRole =
  | 'CEO'
  | 'Legal'
  | 'Corporate Affairs'
  | 'Operations'
  | 'Compliance'
  | 'Company Secretary'
  | 'Crisis Lead'

export interface Organisation {
  id: string
  name: string
  slug: string
  edition: Edition
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  organisation_id: string
  email: string
  name: string
  role: string
  created_at: string
}

export interface Incident {
  id: string
  organisation_id: string
  title: string
  status: IncidentStatus
  severity: Severity | null
  dimension: Dimension | null
  scenario: string
  owner: string | null
  statement: string
  statement_lang: Lang
  created_by: string | null
  created_at: string
  updated_at: string
  closed_at: string | null
}

export interface IncidentUpdate {
  id: string
  incident_id: string
  kind: string
  body: string
  actor: string
  created_at: string
}

export interface Task {
  id: string
  incident_id: string
  step_index: number | null
  title: string
  owner: string | null
  status: TaskStatus
  due_band: string | null
  due_at: string | null
  escalated_at: string | null
  completed_at: string | null
  created_at: string
}

export interface QuorumResponse {
  id: string
  incident_id: string
  role: QuorumRole | string
  respondent_name: string | null
  state: QuorumState
  note: string | null
  responded_at: string | null
  created_at: string
}

export interface Report {
  id: string
  incident_id: string
  organisation_id: string
  kind: string
  title: string
  r2_key: string | null
  status: string
  created_by: string | null
  created_at: string
}

export interface AuditEntry {
  id: string
  organisation_id: string
  incident_id: string | null
  actor: string
  action: string
  detail: string | null
  created_at: string
  /** Hash-chain fields (migration 0006) — null on rows written before the
   * chain existed; see IncidentRepository.verifyAuditChain. */
  prev_hash?: string | null
  hash?: string | null
}

export interface Env {
  DB: D1Database
  CONFIG: KVNamespace
  REPORTS: R2Bucket
  INCIDENT_ROOM: DurableObjectNamespace
  /** Optional — every AI-assisted path degrades to its deterministic
   * fallback (rules engine / template) when this binding isn't configured,
   * same pattern as everywhere else in this API. */
  AI?: Ai
  APP_NAME: string
  API_VERSION: string
}
