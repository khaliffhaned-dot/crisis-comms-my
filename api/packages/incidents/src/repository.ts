import {
  id,
  nowIso,
  NotFoundError,
  type Env,
  type Incident,
  type IncidentStatus,
  type Task,
  type TaskStatus,
  type QuorumResponse,
  type QuorumState,
  type AuditEntry,
} from '@escalate-my/shared'
import { FIRST_60_STEPS, bandUpperMinutes } from './first60'

export interface IncidentPatch {
  title?: string
  status?: IncidentStatus
  severity?: number | null
  dimension?: string | null
  scenario?: string
  owner?: string | null
  statement?: string
  statement_lang?: string
}

export class IncidentRepository {
  constructor(private db: D1Database) {}

  async listActive(organisationId: string): Promise<Incident[]> {
    const res = await this.db
      .prepare(
        `SELECT * FROM incidents WHERE organisation_id = ? AND status != 'closed' ORDER BY updated_at DESC`
      )
      .bind(organisationId)
      .all<Incident>()
    return res.results ?? []
  }

  async get(idValue: string): Promise<Incident> {
    const row = await this.db.prepare(`SELECT * FROM incidents WHERE id = ?`).bind(idValue).first<Incident>()
    if (!row) throw new NotFoundError('Incident')
    return row
  }

  async create(input: {
    organisation_id: string
    title: string
    scenario?: string
    owner?: string
    created_by?: string
  }): Promise<Incident> {
    const incident: Incident = {
      id: id('INC'),
      organisation_id: input.organisation_id,
      title: input.title,
      status: 'open',
      severity: null,
      dimension: null,
      scenario: input.scenario || 'operational',
      owner: input.owner || null,
      statement: '',
      statement_lang: 'bm',
      created_by: input.created_by || null,
      created_at: nowIso(),
      updated_at: nowIso(),
      closed_at: null,
    }
    await this.db
      .prepare(
        `INSERT INTO incidents (id, organisation_id, title, status, scenario, owner, statement, statement_lang, created_by, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        incident.id,
        incident.organisation_id,
        incident.title,
        incident.status,
        incident.scenario,
        incident.owner,
        incident.statement,
        incident.statement_lang,
        incident.created_by,
        incident.created_at,
        incident.updated_at
      )
      .run()
    return incident
  }

  async updateSeverity(incidentId: string, severity: number): Promise<void> {
    await this.db
      .prepare(`UPDATE incidents SET severity = ?, updated_at = ? WHERE id = ?`)
      .bind(severity, nowIso(), incidentId)
      .run()
  }

  async close(incidentId: string): Promise<Incident> {
    const closedAt = nowIso()
    await this.db
      .prepare(`UPDATE incidents SET status = 'closed', closed_at = ?, updated_at = ? WHERE id = ?`)
      .bind(closedAt, closedAt, incidentId)
      .run()
    return this.get(incidentId)
  }

  async setStatus(incidentId: string, status: IncidentStatus): Promise<void> {
    await this.db
      .prepare(`UPDATE incidents SET status = ?, updated_at = ? WHERE id = ?`)
      .bind(status, nowIso(), incidentId)
      .run()
  }

  /** Generic partial update used by PATCH /incidents/:id. Only touches fields that were actually sent. */
  async update(incidentId: string, patch: IncidentPatch): Promise<Incident> {
    const fields: string[] = []
    const values: unknown[] = []
    for (const [key, value] of Object.entries(patch)) {
      if (value === undefined) continue
      fields.push(`${key} = ?`)
      values.push(value)
    }
    if (fields.length > 0) {
      fields.push(`updated_at = ?`)
      values.push(nowIso())
      values.push(incidentId)
      await this.db.prepare(`UPDATE incidents SET ${fields.join(', ')} WHERE id = ?`).bind(...values).run()
    }
    return this.get(incidentId)
  }

  /** Seed the 13 First Sixty Minutes™ tasks against a freshly created incident, each with a due_at computed from its band. */
  /**
   * One D1 round-trip via db.batch(), not 13 sequential .run() awaits — the
   * actual perf win intended here — but each of the 13 rows is still its
   * own prepared statement. A single INSERT with all 13 rows' values
   * flattened into one VALUES list (9 columns × 13 rows = 117 bound
   * parameters) throws "too many SQL variables: SQLITE_ERROR" — D1's bound
   * parameter ceiling is well under that, so every incident creation was
   * failing with a 500 until this was batch()'d instead.
   */
  async seedFirst60Tasks(incidentId: string, incidentCreatedAt: string): Promise<void> {
    const t0 = new Date(incidentCreatedAt).getTime()
    const now = nowIso()

    if (FIRST_60_STEPS.length === 0) return

    const insert = this.db.prepare(
      `INSERT INTO tasks (id, incident_id, step_index, title, owner, status, due_band, due_at, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    const statements = FIRST_60_STEPS.map((step) => {
      const dueAt = new Date(t0 + bandUpperMinutes(step.band) * 60 * 1000).toISOString()
      return insert.bind(id('TSK'), incidentId, step.step, step.en, step.owner, 'pending', step.band, dueAt, now)
    })

    await this.db.batch(statements)
  }

  async listTasks(incidentId: string): Promise<Task[]> {
    const res = await this.db
      .prepare(`SELECT * FROM tasks WHERE incident_id = ? ORDER BY step_index ASC`)
      .bind(incidentId)
      .all<Task>()
    return res.results ?? []
  }

  async getTask(taskId: string): Promise<Task> {
    const row = await this.db.prepare(`SELECT * FROM tasks WHERE id = ?`).bind(taskId).first<Task>()
    if (!row) throw new NotFoundError('Task')
    return row
  }

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<Task> {
    const completedAt = status === 'done' ? nowIso() : null
    await this.db
      .prepare(`UPDATE tasks SET status = ?, completed_at = ? WHERE id = ?`)
      .bind(status, completedAt, taskId)
      .run()
    return this.getTask(taskId)
  }

  async listQuorum(incidentId: string): Promise<QuorumResponse[]> {
    const res = await this.db
      .prepare(`SELECT * FROM quorum_responses WHERE incident_id = ? ORDER BY created_at ASC`)
      .bind(incidentId)
      .all<QuorumResponse>()
    return res.results ?? []
  }

  /** Upsert a quorum vote for one role on one incident (unique per incident_id + role). */
  async upsertQuorumVote(
    incidentId: string,
    role: string,
    patch: { state: QuorumState; note?: string | null; respondent_name?: string | null }
  ): Promise<void> {
    const now = nowIso()
    await this.db
      .prepare(
        `INSERT INTO quorum_responses (id, incident_id, role, respondent_name, state, note, responded_at, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(incident_id, role) DO UPDATE SET
           state = excluded.state,
           note = excluded.note,
           respondent_name = excluded.respondent_name,
           responded_at = excluded.responded_at`
      )
      .bind(id('QRM'), incidentId, role, patch.respondent_name ?? null, patch.state, patch.note ?? null, now, now)
      .run()
  }

  async listAudit(incidentId: string): Promise<AuditEntry[]> {
    const res = await this.db
      .prepare(`SELECT * FROM audit_log WHERE incident_id = ? ORDER BY created_at DESC LIMIT 200`)
      .bind(incidentId)
      .all<AuditEntry>()
    return res.results ?? []
  }

  /**
   * Hash-chained per organisation (see migrations/0006_audit_chain.sql) so a
   * row edited or deleted directly in D1 — bypassing writeAudit — breaks the
   * chain from that point on, detectable via verifyAuditChain(). Scoped per
   * organisation, ordered by SQLite's implicit rowid (insertion order) since
   * `id()` is random and `created_at` can tie on rapid consecutive writes.
   * Not a distributed ledger: a write racing this read-then-insert in the
   * same organisation could theoretically interleave, but this tool's write
   * volume is human-paced, not high-throughput, and the goal is catching
   * direct-DB tampering after the fact, not serializing concurrent writers.
   */
  async writeAudit(entry: {
    organisation_id: string
    incident_id?: string | null
    actor: string
    action: string
    detail?: string
  }) {
    const prevRow = await this.db
      .prepare(`SELECT hash FROM audit_log WHERE organisation_id = ? ORDER BY rowid DESC LIMIT 1`)
      .bind(entry.organisation_id)
      .first<{ hash: string | null }>()
    const prevHash = prevRow?.hash ?? ''

    const auditId = id('AUD')
    const createdAt = nowIso()
    const detail = entry.detail ?? null
    const hash = await hashAuditEntry({
      prevHash,
      id: auditId,
      organisation_id: entry.organisation_id,
      incident_id: entry.incident_id ?? null,
      actor: entry.actor,
      action: entry.action,
      detail,
      created_at: createdAt,
    })

    await this.db
      .prepare(
        `INSERT INTO audit_log (id, organisation_id, incident_id, actor, action, detail, created_at, prev_hash, hash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(auditId, entry.organisation_id, entry.incident_id ?? null, entry.actor, entry.action, detail, createdAt, prevHash, hash)
      .run()
  }

  /**
   * Walks an organisation's audit_log in insertion order and recomputes
   * each row's hash, failing at the first mismatch or broken prev_hash
   * link. Rows written before migration 0006 have no hash (NULL) and are
   * excluded from the chain entirely — historical data the chain never
   * signed is neither valid nor broken, just outside its scope.
   */
  async verifyAuditChain(organisationId: string): Promise<{ valid: boolean; checked: number; brokenAt?: string }> {
    const res = await this.db
      .prepare(`SELECT * FROM audit_log WHERE organisation_id = ? AND hash IS NOT NULL ORDER BY rowid ASC`)
      .bind(organisationId)
      .all<AuditEntry & { prev_hash: string | null; hash: string | null }>()
    const rows = res.results ?? []

    let expectedPrev = ''
    let checked = 0
    for (const row of rows) {
      if ((row.prev_hash ?? '') !== expectedPrev) {
        return { valid: false, checked, brokenAt: row.id }
      }
      const recomputed = await hashAuditEntry({
        prevHash: expectedPrev,
        id: row.id,
        organisation_id: row.organisation_id,
        incident_id: row.incident_id,
        actor: row.actor,
        action: row.action,
        detail: row.detail,
        created_at: row.created_at,
      })
      if (recomputed !== row.hash) {
        return { valid: false, checked, brokenAt: row.id }
      }
      expectedPrev = row.hash as string
      checked++
    }
    return { valid: true, checked }
  }
}

async function hashAuditEntry(fields: {
  prevHash: string
  id: string
  organisation_id: string
  incident_id: string | null
  actor: string
  action: string
  detail: string | null
  created_at: string
}): Promise<string> {
  const canonical = [
    fields.prevHash,
    fields.id,
    fields.organisation_id,
    fields.incident_id ?? '',
    fields.actor,
    fields.action,
    fields.detail ?? '',
    fields.created_at,
  ].join('\u0000')
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical))
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export function incidentRepo(env: Env) {
  return new IncidentRepository(env.DB)
}

