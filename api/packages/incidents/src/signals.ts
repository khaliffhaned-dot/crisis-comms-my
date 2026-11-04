import { id, nowIso, NotFoundError, ValidationError, type Env, type Signal, type Severity, type ThreeRAssessment } from '@escalate-my/shared'
import { matchObligations, type ObligationRow } from '@escalate-my/regulatory'
import { assessIncidentRules } from './decisionIntelligence'
import { assessThreeR } from './culturalSensitivity'

/** The universal schema an external system posts to create a signal. */
export interface SignalInput {
  incident_type: string
  source: string
  description: string
  severity_hint?: string
  timestamp?: string
}

interface SignalAssessment {
  recommended_severity: Severity
  confidence: number
  potential_stakeholders: string[]
  potential_authorities: string[]
  three_r: ThreeRAssessment
}

const STAKEHOLDER_RULES: Array<{ pattern: RegExp; stakeholders: string[] }> = [
  { pattern: /cyber|data|breach|ransomware/i, stakeholders: ['Customers', 'Regulators', 'IT/Security Team'] },
  { pattern: /reputation|media|social|brand/i, stakeholders: ['Customers', 'Media', 'Regulators'] },
  { pattern: /governance|board|executive|misconduct/i, stakeholders: ['Board', 'Shareholders', 'Regulators'] },
]
const DEFAULT_STAKEHOLDERS = ['Customers', 'Regulators', 'Local Authorities']

function inferStakeholders(input: SignalInput): string[] {
  const text = `${input.incident_type} ${input.description}`
  for (const rule of STAKEHOLDER_RULES) {
    if (rule.pattern.test(text)) return rule.stakeholders
  }
  return DEFAULT_STAKEHOLDERS
}

/**
 * The full assessment a human sees before deciding to create or dismiss an
 * incident: severity + confidence (assessIncidentRules — the same rules
 * engine Decision Intelligence uses, deterministic, never AI), likely
 * stakeholders (a small keyword lookup), potential regulators (matched
 * against the real regulatory_obligations catalog, never invented), and a
 * 3R sensitivity flag. Needs a DB handle only to match obligations —
 * everything else is pure.
 */
async function assessSignal(db: D1Database, input: SignalInput): Promise<SignalAssessment> {
  const type = input.incident_type.toLowerCase()
  const source = input.source.toLowerCase()
  const hint = (input.severity_hint ?? '').toLowerCase()
  // The domain keywords (cyber, electrical, substation, …) describe what
  // happened, which lives in the description text, not in the short
  // incident_type/source fields — testing only type/source against them
  // was a bug: "operational" / "Bernama" never contain "substation".
  const text = `${type} ${input.description.toLowerCase()}`

  const mediaAttention = /reputation|media|social|brand/.test(text) || /meltwater|brandwatch|talkwalker|dataminr/.test(source)
  const regulatoryInvolved =
    /cyber|data|breach|compliance|security|electrical|substation|power|energy|grid/.test(text) || /sentinel|crowdstrike/.test(source)
  const possibleMaterialInfo = /critical|high|severe|urgent/.test(hint) || /^[34]$/.test(hint.trim())

  const rulesResult = assessIncidentRules({
    facts: input.description,
    mediaAttention,
    possibleMaterialInfo,
    regulatoryInvolved,
  })

  const obligationRows = await db
    .prepare(
      `SELECT id, regulator, code, title_en, title_bm, trigger_hints, deadline_en, deadline_bm, status, active, deadline_hours FROM regulatory_obligations WHERE active = 1`
    )
    .all<ObligationRow>()
  const matched = matchObligations(input.description, obligationRows.results ?? [])
  const potential_authorities = [...new Set(matched.map((m) => m.regulator))]

  return {
    recommended_severity: rulesResult.severity,
    confidence: rulesResult.confidence,
    potential_stakeholders: inferStakeholders(input),
    potential_authorities,
    three_r: assessThreeR(input.description),
  }
}

function rowToSignal(row: Record<string, unknown>): Signal {
  return {
    id: row.id as string,
    organisation_id: row.organisation_id as string,
    source: row.source as string,
    incident_type: row.incident_type as string,
    description: row.description as string,
    severity_hint: (row.severity_hint as string) ?? null,
    recommended_severity: (row.recommended_severity as Severity) ?? null,
    potential_stakeholders: row.potential_stakeholders ? JSON.parse(row.potential_stakeholders as string) : [],
    potential_authorities: row.potential_authorities ? JSON.parse(row.potential_authorities as string) : [],
    confidence: (row.confidence as number) ?? null,
    three_r:
      row.three_r_royal || row.three_r_race || row.three_r_religion
        ? {
            royal: (row.three_r_royal as ThreeRAssessment['royal']) ?? 'Low',
            race: (row.three_r_race as ThreeRAssessment['race']) ?? 'Low',
            religion: (row.three_r_religion as ThreeRAssessment['religion']) ?? 'Low',
          }
        : null,
    occurred_at: row.occurred_at as string,
    status: row.status as Signal['status'],
    incident_id: (row.incident_id as string) ?? null,
    created_at: row.created_at as string,
    resolved_at: (row.resolved_at as string) ?? null,
    resolved_by: (row.resolved_by as string) ?? null,
  }
}

export class SignalRepository {
  constructor(private db: D1Database) {}

  async create(organisationId: string, input: SignalInput): Promise<Signal> {
    const assessment = await assessSignal(this.db, input)
    const signal: Signal = {
      id: id('SIG'),
      organisation_id: organisationId,
      source: input.source,
      incident_type: input.incident_type,
      description: input.description,
      severity_hint: input.severity_hint ?? null,
      recommended_severity: assessment.recommended_severity,
      potential_stakeholders: assessment.potential_stakeholders,
      potential_authorities: assessment.potential_authorities,
      confidence: assessment.confidence,
      three_r: assessment.three_r,
      occurred_at: input.timestamp || nowIso(),
      status: 'pending',
      incident_id: null,
      created_at: nowIso(),
      resolved_at: null,
      resolved_by: null,
    }
    await this.db
      .prepare(
        `INSERT INTO signals (id, organisation_id, source, incident_type, description, severity_hint, recommended_severity, potential_stakeholders, potential_authorities, confidence, three_r_royal, three_r_race, three_r_religion, occurred_at, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`
      )
      .bind(
        signal.id,
        signal.organisation_id,
        signal.source,
        signal.incident_type,
        signal.description,
        signal.severity_hint,
        signal.recommended_severity,
        JSON.stringify(signal.potential_stakeholders),
        JSON.stringify(signal.potential_authorities),
        signal.confidence,
        signal.three_r?.royal ?? null,
        signal.three_r?.race ?? null,
        signal.three_r?.religion ?? null,
        signal.occurred_at,
        signal.created_at
      )
      .run()
    return signal
  }

  async list(organisationId: string, status?: string): Promise<Signal[]> {
    const res = status
      ? await this.db
          .prepare(`SELECT * FROM signals WHERE organisation_id = ? AND status = ? ORDER BY created_at DESC LIMIT 200`)
          .bind(organisationId, status)
          .all<Record<string, unknown>>()
      : await this.db
          .prepare(`SELECT * FROM signals WHERE organisation_id = ? ORDER BY created_at DESC LIMIT 200`)
          .bind(organisationId)
          .all<Record<string, unknown>>()
    return (res.results ?? []).map(rowToSignal)
  }

  async get(signalId: string): Promise<Signal> {
    const row = await this.db.prepare(`SELECT * FROM signals WHERE id = ?`).bind(signalId).first<Record<string, unknown>>()
    if (!row) throw new NotFoundError('Signal')
    return rowToSignal(row)
  }

  /** Marks a signal actioned and links it to the incident it became. Fails loudly on a signal that's already been resolved — a double-click must never create two incidents from the same signal. */
  async markActioned(signalId: string, incidentId: string, actor: string): Promise<Signal> {
    const signal = await this.get(signalId)
    if (signal.status !== 'pending') {
      throw new ValidationError(`Signal already ${signal.status}`)
    }
    const resolvedAt = nowIso()
    await this.db
      .prepare(`UPDATE signals SET status = 'actioned', incident_id = ?, resolved_at = ?, resolved_by = ? WHERE id = ?`)
      .bind(incidentId, resolvedAt, actor, signalId)
      .run()
    return { ...signal, status: 'actioned', incident_id: incidentId, resolved_at: resolvedAt, resolved_by: actor }
  }

  async dismiss(signalId: string, actor: string): Promise<Signal> {
    const signal = await this.get(signalId)
    if (signal.status !== 'pending') {
      throw new ValidationError(`Signal already ${signal.status}`)
    }
    const resolvedAt = nowIso()
    await this.db
      .prepare(`UPDATE signals SET status = 'dismissed', resolved_at = ?, resolved_by = ? WHERE id = ?`)
      .bind(resolvedAt, actor, signalId)
      .run()
    return { ...signal, status: 'dismissed', resolved_at: resolvedAt, resolved_by: actor }
  }
}

export function signalRepo(env: Env) {
  return new SignalRepository(env.DB)
}
