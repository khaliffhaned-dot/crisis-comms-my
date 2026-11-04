export interface OverdueTaskRow {
  task_id: string
  incident_id: string
  organisation_id: string
  step_index: number | null
  title: string
  owner: string | null
  due_band: string | null
}

/**
 * Find First Sixty Minutes™ tasks whose due_at has arrived, are still
 * pending, haven't already been flagged, and belong to an incident that's
 * still open (closing an incident, or marking a task done/skipped, retires
 * it from this check — no reason to escalate a task nobody is chasing
 * anymore).
 */
export async function findOverdueTasks(db: D1Database, asOf: string): Promise<OverdueTaskRow[]> {
  const res = await db
    .prepare(
      `SELECT t.id as task_id, t.incident_id, i.organisation_id, t.step_index, t.title, t.owner, t.due_band
       FROM tasks t
       JOIN incidents i ON i.id = t.incident_id
       WHERE t.status = 'pending'
         AND t.due_at IS NOT NULL AND t.due_at <= ?
         AND t.escalated_at IS NULL
         AND i.status != 'closed'`
    )
    .bind(asOf)
    .all<OverdueTaskRow>()
  return res.results ?? []
}

/** Mark a task escalated. Does not change its status — it may still be completed normally. */
export async function escalateTask(db: D1Database, taskId: string, at: string): Promise<void> {
  await db.prepare(`UPDATE tasks SET escalated_at = ? WHERE id = ?`).bind(at, taskId).run()
}
