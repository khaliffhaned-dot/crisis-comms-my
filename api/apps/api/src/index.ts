import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Env, IntelligenceAssessInput } from '@escalate-my/shared'
import { AppError } from '@escalate-my/shared'
import { IncidentService, assessIncidentRules } from '@escalate-my/incidents'
import { listRegulatoryClocks, matchObligations, type ObligationRow } from '@escalate-my/regulatory'
import { generateAndStoreBrief, buildBoardInsights } from '@escalate-my/boardbrief'

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors())

app.get('/health', (c) =>
  c.json({ ok: true, service: 'escalate-my-api', intelligence: ['decision', 'regulatory', 'board'] })
)

app.get('/api/v1/regulatory/clocks', (c) => c.json({ clocks: listRegulatoryClocks() }))

/** Regulatory Intelligence™ — match facts to obligation catalog */
app.post('/api/v1/intelligence/obligations', async (c) => {
  const body = await c.req.json<{ facts: string; bursa_listed?: boolean }>()
  if (!body.facts) return c.json({ error: 'facts required' }, 400)
  const res = await c.env.DB.prepare(
    `SELECT id, regulator, code, title_en, title_bm, trigger_hints, deadline_en, deadline_bm, status, active FROM regulatory_obligations WHERE active = 1`
  ).all<ObligationRow>()
  const matched = matchObligations(body.facts, res.results ?? [], {
    bursaListed: body.bursa_listed,
  })
  return c.json({
    matched,
    headline:
      matched.length > 0
        ? 'Potential regulatory obligations detected — review required'
        : 'No catalog matches — continue manual Regulatory Clock review',
    disclaimer: 'Not legal advice. Counsel must verify all obligations.',
  })
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

export default app
