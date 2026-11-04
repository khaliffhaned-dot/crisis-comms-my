import { id, nowIso, type MatchedObligation } from '@escalate-my/shared'

function addHoursIso(hours: number): string {
  const d = new Date()
  d.setTime(d.getTime() + hours * 60 * 60 * 1000)
  return d.toISOString()
}

export interface IncidentObligation {
  id: string
  incident_id: string
  obligation_id: string
  match_score: number
  triggered_at: string
  deadline_at: string | null
  status: 'pending' | 'escalated' | 'met' | 'not_applicable'
  escalated_at: string | null
  created_at: string
}

/**
 * Persist matched obligations against an incident so the Regulatory Clock
 * cron can track their deadlines. Only obligations with a known
 * `deadline_hours` get a computed deadline_at — everything else is tracked
 * (visible on the incident) but never auto-escalated, since its wording
 * isn't a fixed window.
 *
 * Idempotent: re-running with the same incident/obligation pair is a no-op
 * (UNIQUE (incident_id, obligation_id) + ON CONFLICT DO NOTHING), so calling
 * this again as new facts come in won't reset a deadline that's already ticking.
 */
export async function trackObligations(
  db: D1Database,
  incidentId: string,
  matched: MatchedObligation[],
  deadlineHoursById: Map<string, number | null | undefined>
): Promise<void> {
  const now = nowIso()
  for (const m of matched) {
    const hours = deadlineHoursById.get(m.id)
    const deadlineAt = typeof hours === 'number' ? addHoursIso(hours) : null
    await db
      .prepare(
        `INSERT INTO incident_obligations (id, incident_id, obligation_id, match_score, triggered_at, deadline_at, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
         ON CONFLICT(incident_id, obligation_id) DO NOTHING`
      )
      .bind(id('IOB'), incidentId, m.id, m.match_score, now, deadlineAt, now)
      .run()
  }
}

export interface OverdueObligationRow {
  io_id: string
  incident_id: string
  organisation_id: string
  obligation_id: string
  regulator: string
  title_en: string
  title_bm: string
}

/**
 * Find tracked obligations whose deadline has arrived (or passed) and are
 * still pending. Does not assert a breach occurred — only that it needs a
 * human to look now. A human marks it 'met' or 'not_applicable' afterwards;
 * this never changes incident severity or notifies anyone outside the
 * platform on its own.
 */
export async function findOverdueObligations(db: D1Database, asOf: string): Promise<OverdueObligationRow[]> {
  const res = await db
    .prepare(
      `SELECT io.id as io_id, io.incident_id, i.organisation_id, io.obligation_id,
              o.regulator, o.title_en, o.title_bm
       FROM incident_obligations io
       JOIN incidents i ON i.id = io.incident_id
       JOIN regulatory_obligations o ON o.id = io.obligation_id
       WHERE io.status = 'pending' AND io.deadline_at IS NOT NULL AND io.deadline_at <= ?`
    )
    .bind(asOf)
    .all<OverdueObligationRow>()
  return res.results ?? []
}

/** Mark an obligation escalated. Call once per overdue row found. */
export async function escalateObligation(db: D1Database, incidentObligationId: string, at: string): Promise<void> {
  await db
    .prepare(`UPDATE incident_obligations SET status = 'escalated', escalated_at = ? WHERE id = ?`)
    .bind(at, incidentObligationId)
    .run()
}

/**
 * Start tracking one specific obligation against one incident — the manual
 * "start this clock" path (as opposed to trackObligations' fact-matched
 * bulk path). Idempotent: starting an already-tracked obligation is a no-op.
 */
export async function startObligationTracking(db: D1Database, incidentId: string, obligationId: string): Promise<void> {
  const catalog = await db
    .prepare(`SELECT deadline_hours FROM regulatory_obligations WHERE id = ?`)
    .bind(obligationId)
    .first<{ deadline_hours: number | null }>()
  const now = nowIso()
  const deadlineAt = typeof catalog?.deadline_hours === 'number' ? addHoursIso(catalog.deadline_hours) : null
  await db
    .prepare(
      `INSERT INTO incident_obligations (id, incident_id, obligation_id, match_score, triggered_at, deadline_at, status, created_at)
       VALUES (?, ?, ?, 100, ?, ?, 'pending', ?)
       ON CONFLICT(incident_id, obligation_id) DO NOTHING`
    )
    .bind(id('IOB'), incidentId, obligationId, now, deadlineAt, now)
    .run()
}

/** Stop tracking (remove) an obligation from an incident — the manual "un-start this clock" path. */
export async function stopObligationTracking(db: D1Database, incidentId: string, obligationId: string): Promise<void> {
  await db
    .prepare(`DELETE FROM incident_obligations WHERE incident_id = ? AND obligation_id = ?`)
    .bind(incidentId, obligationId)
    .run()
}
