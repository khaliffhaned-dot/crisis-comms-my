import { recommendSeverity, id, nowIso, NotFoundError, ValidationError, type Env, type Signal, type Severity } from '@escalate-my/shared'

/** The universal schema an external system posts to create a signal. */
export interface SignalInput {
  incident_type: string
  source: string
  description: string
  severity_hint?: string
  timestamp?: string
}

/**
 * Best-effort, rules-only mapping from the free-text universal schema onto
 * the existing SeverityInput heuristic (shared/src/severity.ts) — the same
 * deterministic rules engine the rest of the product uses, never an LLM.
 * This is explicitly a *hint*: recommended_severity is shown to a human
 * alongside the raw signal and only takes effect once they action it into
 * a real incident (see SignalRepository.action()). Getting this mapping
 * imperfect is fine — getting it silently authoritative would not be.
 */
export function inferSeverity(input: SignalInput): Severity {
  const type = input.incident_type.toLowerCase()
  const source = input.source.toLowerCase()
  const hint = (input.severity_hint ?? '').toLowerCase()

  const mediaAttention = /reputation|media|social|brand/.test(type) || /meltwater|brandwatch|talkwalker|dataminr/.test(source)
  const regulatoryInvolved = /cyber|data|breach|compliance|security/.test(type) || /sentinel|crowdstrike/.test(source)
  const possibleMaterialInfo = /critical|high|severe|urgent/.test(hint) || /^[34]$/.test(hint.trim())

  return recommendSeverity({
    facts: input.description,
    mediaAttention,
    possibleMaterialInfo,
    regulatoryInvolved,
  })
}

export class SignalRepository {
  constructor(private db: D1Database) {}

  async create(organisationId: string, input: SignalInput): Promise<Signal> {
    const recommended = inferSeverity(input)
    const signal: Signal = {
      id: id('SIG'),
      organisation_id: organisationId,
      source: input.source,
      incident_type: input.incident_type,
      description: input.description,
      severity_hint: input.severity_hint ?? null,
      recommended_severity: recommended,
      occurred_at: input.timestamp || nowIso(),
      status: 'pending',
      incident_id: null,
      created_at: nowIso(),
      resolved_at: null,
      resolved_by: null,
    }
    await this.db
      .prepare(
        `INSERT INTO signals (id, organisation_id, source, incident_type, description, severity_hint, recommended_severity, occurred_at, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`
      )
      .bind(
        signal.id,
        signal.organisation_id,
        signal.source,
        signal.incident_type,
        signal.description,
        signal.severity_hint,
        signal.recommended_severity,
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
          .all<Signal>()
      : await this.db
          .prepare(`SELECT * FROM signals WHERE organisation_id = ? ORDER BY created_at DESC LIMIT 200`)
          .bind(organisationId)
          .all<Signal>()
    return res.results ?? []
  }

  async get(signalId: string): Promise<Signal> {
    const row = await this.db.prepare(`SELECT * FROM signals WHERE id = ?`).bind(signalId).first<Signal>()
    if (!row) throw new NotFoundError('Signal')
    return row
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
