import { id, nowIso, NotFoundError, type Env, type Incident, type IncidentStatus, type Task } from '@escalate-my/shared'
import { FIRST_60_STEPS, bandUpperMinutes } from './first60'

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

  /** Seed the 13 First Sixty Minutes™ tasks against a freshly created incident, each with a due_at computed from its band. */
  async seedFirst60Tasks(incidentId: string, incidentCreatedAt: string): Promise<void> {
    const t0 = new Date(incidentCreatedAt).getTime()
    const now = nowIso()
    for (const step of FIRST_60_STEPS) {
      const dueAt = new Date(t0 + bandUpperMinutes(step.band) * 60 * 1000).toISOString()
      await this.db
        .prepare(
          `INSERT INTO tasks (id, incident_id, step_index, title, owner, status, due_band, due_at, created_at)
           VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?)`
        )
        .bind(id('TSK'), incidentId, step.step, step.en, step.owner, step.band, dueAt, now)
        .run()
    }
  }

  async listTasks(incidentId: string): Promise<Task[]> {
    const res = await this.db
      .prepare(`SELECT * FROM tasks WHERE incident_id = ? ORDER BY step_index ASC`)
      .bind(incidentId)
      .all<Task>()
    return res.results ?? []
  }

  async writeAudit(entry: {
    organisation_id: string
    incident_id?: string | null
    actor: string
    action: string
    detail?: string
  }) {
    await this.db
      .prepare(
        `INSERT INTO audit_log (id, organisation_id, incident_id, actor, action, detail, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(id('AUD'), entry.organisation_id, entry.incident_id ?? null, entry.actor, entry.action, entry.detail ?? null, nowIso())
      .run()
  }
}

export function incidentRepo(env: Env) {
  return new IncidentRepository(env.DB)
}
