import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Env, IntelligenceAssessInput } from '@escalate-my/shared'
import { AppError, nowIso } from '@escalate-my/shared'
import {
  IncidentService,
  incidentRepo,
  assessIncidentRules,
  findOverdueTasks,
  escalateTask,
} from '@escalate-my/incidents'
import {
  listRegulatoryClocks,
  matchObligations,
  trackObligations,
  findOverdueObligations,
  escalateObligation,
  type ObligationRow,
} from '@escalate-my/regulatory'
import { generateAndStoreBrief, buildBoardInsights } from '@escalate-my/boardbrief'

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors())

app.get('/health', (c) =>
  c.json({ ok: true, service: 'escalate-my-api', intelligence: ['decision', 'regulatory', 'board'] })
)

app.get('/api/v1/regulatory/clocks', (c) => c.json({ clocks: listRegulatoryClocks() }))

/** Regulatory Intelligence™ — match facts to obligation catalog */
app.post('/api/v1/intelligence/obligations', async (c) => {
  const body = await c.req.json<{ facts: string; bursa_listed?: boolean; incident_id?: string }>()
  if (!body.facts) return c.json({ error: 'facts required' }, 400)
  const res = await c.env.DB.prepare(
    `SELECT id, regulator, code, title_en, title_bm, trigger_hints, deadline_en, deadline_bm, status, active, deadline_hours FROM regulatory_obligations WHERE active = 1`
  ).all<ObligationRow>()
  const rows = res.results ?? []
  const matched = matchObligations(body.facts, rows, {
    bursaListed: body.bursa_listed,
  })

  let tracked = false
  if (body.incident_id && matched.length > 0) {
    const deadlineHoursById = new Map(rows.map((r) => [r.id, r.deadline_hours]))
    await trackObligations(c.env.DB, body.incident_id, matched, deadlineHoursById)
    tracked = true
  }

  return c.json({
    matched,
    tracked,
    headline:
      matched.length > 0
        ? 'Potential regulatory obligations detected — review required'
        : 'No catalog matches — continue manual Regulatory Clock review',
    disclaimer: 'Not legal advice. Counsel must verify all obligations.',
  })
})

/** Regulatory Clock™ — obligations tracked against one incident, with computed deadlines */
app.get('/api/v1/incidents/:id/obligations', async (c) => {
  const res = await c.env.DB.prepare(
    `SELECT io.id, io.obligation_id, io.status, io.triggered_at, io.deadline_at, io.escalated_at,
            o.regulator, o.code, o.title_en, o.title_bm
     FROM incident_obligations io
     JOIN regulatory_obligations o ON o.id = io.obligation_id
     WHERE io.incident_id = ?
     ORDER BY io.deadline_at IS NULL, io.deadline_at ASC`
  )
    .bind(c.req.param('id'))
    .all()
  return c.json({ items: res.results ?? [] })
})

/** Decision Intelligence™ — severity + recommended actions */
app.post('/api/v1/intelligence/assess', async (c) => {
  const body = await c.req.json<IntelligenceAssessInput>()
  if (!body.facts) return c.json({ error: 'facts required' }, 400)
  const result = assessIncidentRules(body)
  return c.json(result)
})

/** Board Intelligence™ — insights over incident state */
app.get('/api/v1/intelligence/board/:incidentId', async (c) => {
  const svc = new IncidentService(c.env)
  const incident = await svc.get(c.req.param('incidentId'))
  const quorum = await c.env.DB.prepare(`SELECT * FROM quorum_responses WHERE incident_id = ?`)
    .bind(incident.id)
    .all()
  const tasks = await c.env.DB.prepare(
    `SELECT COUNT(*) as n FROM tasks WHERE incident_id = ? AND status != 'done'`
  )
    .bind(incident.id)
    .first<{ n: number }>()
  const insights = buildBoardInsights({
    incident,
    quorum: (quorum.results || []) as any,
    openTaskCount: tasks?.n ?? 0,
  })
  return c.json({ incident_id: incident.id, insights })
})

app.get('/api/v1/incidents', async (c) => {
  const org = c.req.query('organisation_id')
  if (!org) return c.json({ error: 'organisation_id required' }, 400)
  const svc = new IncidentService(c.env)
  const items = await svc.listActive(org)
  return c.json({ items })
})

app.get('/api/v1/incidents/:id', async (c) => {
  const svc = new IncidentService(c.env)
  const item = await svc.get(c.req.param('id'))
  return c.json({ item })
})

app.post('/api/v1/incidents', async (c) => {
  const body = await c.req.json<{
    organisation_id: string
    title: string
    scenario?: string
    owner?: string
    actor?: string
  }>()
  if (!body.organisation_id || !body.title) return c.json({ error: 'organisation_id and title required' }, 400)
  const svc = new IncidentService(c.env)
  const item = await svc.create(body)
  return c.json({ item }, 201)
})

app.post('/api/v1/incidents/:id/close', async (c) => {
  const body = await c.req.json<{ actor?: string }>().catch(() => ({}) as { actor?: string })
  const svc = new IncidentService(c.env)
  const item = await svc.close(c.req.param('id'), body.actor)
  return c.json({ item })
})

app.post('/api/v1/severity/recommend', async (c) => {
  const body = await c.req.json()
  const svc = new IncidentService(c.env)
  return c.json(svc.recommend(body))
})

app.get('/api/v1/first60', (c) => {
  const svc = new IncidentService(c.env)
  return c.json({ steps: svc.first60() })
})

/** First Sixty Minutes™ — this incident's 13-step checklist, with computed due_at and escalation state */
app.get('/api/v1/incidents/:id/tasks', async (c) => {
  const svc = new IncidentService(c.env)
  const items = await svc.tasks(c.req.param('id'))
  return c.json({ items })
})

app.post('/api/v1/holding-statements', async (c) => {
  const body = await c.req.json<{
    scenario: string
    company: string
    issue: string
    lang?: 'en' | 'bm' | 'both'
  }>()
  const svc = new IncidentService(c.env)
  return c.json(
    svc.holding({
      scenario: body.scenario || 'operational',
      company: body.company || 'Company',
      issue: body.issue || '[issue]',
      lang: body.lang || 'both',
    })
  )
})

app.post('/api/v1/reports/board-brief', async (c) => {
  const body = await c.req.json<{ incident_id: string; kind?: string; actor?: string }>()
  if (!body.incident_id) return c.json({ error: 'incident_id required' }, 400)
  const svc = new IncidentService(c.env)
  const incident = await svc.get(body.incident_id)
  const kind = (body.kind as any) || 'situation_report'
  const result = await generateAndStoreBrief(c.env, incident, kind, body.actor)
  return c.json(result, 201)
})

app.onError((err, c) => {
  if (err instanceof AppError) {
    return c.json({ error: err.message, code: err.code }, err.status as any)
  }
  console.error(err)
  return c.json({ error: 'Internal error' }, 500)
})

/**
 * Regulatory Clock™ cron — runs every 30 minutes (see infrastructure/wrangler
 * wrangler.jsonc `triggers.crons`). Flags incident_obligations whose deadline
 * has arrived so a human sees it, instead of relying on someone remembering
 * to check a countdown. Never changes incident severity and never notifies
 * anyone outside the platform — it only writes an audit_log entry and marks
 * the obligation 'escalated' for the UI to surface. Recommendations only,
 * same as everywhere else in this product.
 */
async function runRegulatoryClockCron(env: Env): Promise<{ escalated: number }> {
  const now = nowIso()
  const overdue = await findOverdueObligations(env.DB, now)
  if (overdue.length === 0) return { escalated: 0 }

  const repo = incidentRepo(env)
  for (const row of overdue) {
    await escalateObligation(env.DB, row.io_id, now)
    await repo.writeAudit({
      organisation_id: row.organisation_id,
      incident_id: row.incident_id,
      actor: 'Sistem',
      action: 'regulatory_deadline_escalated',
      detail: `${row.regulator} — ${row.title_bm} (${row.title_en}): tarikh akhir tercapai, perlu semakan manusia.`,
    })
  }
  return { escalated: overdue.length }
}

/**
 * First Sixty Minutes™ cron — runs every 5 minutes, a much tighter cadence
 * than the Regulatory Clock because this window is 60 minutes wide, not
 * days. Flags tasks whose band deadline (e.g. "0–10 min" -> T0+10min)
 * has passed and are still pending on an open incident. Same posture as
 * the regulatory cron: flags for a human, never reassigns the task,
 * never changes severity, never pages anyone outside the platform.
 */
async function runFirst60EscalationCron(env: Env): Promise<{ escalated: number }> {
  const now = nowIso()
  const overdue = await findOverdueTasks(env.DB, now)
  if (overdue.length === 0) return { escalated: 0 }

  const repo = incidentRepo(env)
  for (const row of overdue) {
    await escalateTask(env.DB, row.task_id, now)
    await repo.writeAudit({
      organisation_id: row.organisation_id,
      incident_id: row.incident_id,
      actor: 'Sistem',
      action: 'first60_task_overdue',
      detail: `Langkah ${row.step_index} (${row.due_band}): "${row.title}" (${row.owner ?? 'pemilik belum ditetapkan'}) belum selesai selepas tempoh ditetapkan.`,
    })
  }
  return { escalated: overdue.length }
}

const REGULATORY_CLOCK_CRON = '*/30 * * * *'
const FIRST60_ESCALATION_CRON = '*/5 * * * *'

export default {
  fetch: app.fetch,
  scheduled: async (event: ScheduledEvent, env: Env, ctx: ExecutionContext) => {
    if (event.cron === REGULATORY_CLOCK_CRON) ctx.waitUntil(runRegulatoryClockCron(env))
    if (event.cron === FIRST60_ESCALATION_CRON) ctx.waitUntil(runFirst60EscalationCron(env))
  },
}
