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

export type SignalStatus = 'pending' | 'actioned' | 'dismissed'

/**
 * A normalized event pushed in from a system Escalate doesn't replace —
 * Meltwater, Sentinel, ServiceNow, a generic webhook, etc. Never becomes
 * an Incident by itself; a human reviews recommended_severity and
 * explicitly actions or dismisses it (see packages/incidents/src/signals.ts).
 */
export type ThreeRLevel = 'Low' | 'Medium' | 'High'

/** Royal / Race / Religion sensitivity flags — see packages/incidents/src/culturalSensitivity.ts for how these are computed and why. */
export interface ThreeRAssessment {
  royal: ThreeRLevel
  race: ThreeRLevel
  religion: ThreeRLevel
}

export interface Signal {
  id: string
  organisation_id: string
  source: string
  incident_type: string
  description: string
  severity_hint: string | null
  recommended_severity: Severity | null
  /** Who's likely affected — a small deterministic lookup by incident_type, not a guess made up per-signal. */
  potential_stakeholders: string[]
  /** Regulator names matched against the real regulatory_obligations catalog (matchObligations) — never fabricated. */
  potential_authorities: string[]
  /** 0-100, same heuristic confidence score as Decision Intelligence's rules-based assessment. */
  confidence: number | null
  three_r: ThreeRAssessment | null
  occurred_at: string
  status: SignalStatus
  incident_id: string | null
  created_at: string
  resolved_at: string | null
  resolved_by: string | null
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
  /** AI Gateway id routed through env.AI.run()'s third argument, for request
   * logging/analytics/caching on Workers AI calls. Optional — unset means
   * calls go straight to the model, same as before AI Gateway was wired up.
   * "default" auto-creates a gateway on first authenticated request, so no
   * account-side setup is required to use it. */
  AI_GATEWAY_ID?: string
  APP_NAME: string
  API_VERSION: string
}
