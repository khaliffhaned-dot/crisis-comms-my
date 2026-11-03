/** Escalate MY Core — shared domain types */

export type Lang = 'bm' | 'en'
export type Severity = 1 | 2 | 3 | 4
export type IncidentStatus = 'open' | 'monitoring' | 'contained' | 'closed'
export type QuorumRole = 'CEO' | 'Legal' | 'Corporate Affairs' | 'Operations' | 'Compliance' | 'Company Secretary' | 'Crisis Lead'
export type QuorumState = 'pending' | 'approved' | 'rejected' | 'abstain'

export interface QuorumVote {
  role: QuorumRole
  name?: string
  state: QuorumState
  at?: string
  note?: string
}

export interface AuditEntry {
  id: string
  at: string
  actor: string
  action: string
  detail?: string
}

export interface Contact {
  id: string
  name: string
  role: string
  group: 'crisis' | 'board' | 'legal' | 'media' | 'government' | 'technical'
  tel: string
  email?: string
}

export interface Incident {
  id: string
  title: string
  status: IncidentStatus
  severity: Severity | null
  dimension: 'Commercial' | 'Policy' | 'National' | null
  scenario: string
  owner: string
  createdAt: string
  updatedAt: string
  checked: boolean[]
  clocks: Record<string, boolean>
  statement: string
  statementLang: Lang
  quorum: QuorumVote[]
  audit: AuditEntry[]
}

export const DEFAULT_QUORUM: QuorumVote[] = [
  { role: 'Crisis Lead', state: 'pending' },
  { role: 'Legal', state: 'pending' },
  { role: 'Company Secretary', state: 'pending' },
  { role: 'Corporate Affairs', state: 'pending' },
  { role: 'CEO', state: 'pending' },
]

export function newIncident(partial?: Partial<Incident>): Incident {
  const now = new Date().toISOString()
  return {
    id: `INC-${Date.now().toString(36).toUpperCase()}`,
    title: partial?.title || 'New incident',
    status: 'open',
    severity: null,
    dimension: null,
    scenario: 'operational',
    owner: 'Crisis Lead',
    createdAt: now,
    updatedAt: now,
    checked: Array(13).fill(false),
    clocks: {},
    statement: '',
    statementLang: 'bm',
    quorum: DEFAULT_QUORUM.map((q) => ({ ...q })),
    audit: [
      {
        id: `AUD-${Date.now()}`,
        at: now,
        actor: 'System',
        action: 'Incident created',
      },
    ],
    ...partial,
  }
}
