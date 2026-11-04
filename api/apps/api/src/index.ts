import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Env, IntelligenceAssessInput } from '@escalate-my/shared'
import { AppError, nowIso, resolveIdentity } from '@escalate-my/shared'
import {
  IncidentService,
  incidentRepo,
  assessIncidentRules,
  findOverdueTasks,
  escalateTask,
  memberRepo,
  getOrganisationSettings,
  putOrganisationSettings,
  signalRepo,
  getSignalKeyStatus,
  rotateSignalKey,
  verifySignalKey,
  type SignalInput,
} from '@escalate-my/incidents'
import {
  listRegulatoryClocks,
  matchObligations,
  trackObligations,
  findOverdueObligations,
  escalateObligation,
  startObligationTracking,
  stopObligationTracking,
  obligationIdForUiClock,
  uiClockIdForObligation,
  type ObligationRow,
} from '@escalate-my/regulatory'
import { generateAndStoreBrief, buildBoardInsights } from '@escalate-my/boardbrief'
import { checkRole } from './authz'
import { IncidentRoom } from './incidentRoom'

export { IncidentRoom }

/**
 * Tells the incident's IncidentRoom Durable Object that something changed,
 * so it can relay a lightweight "refetch" push to connected WebSocket
 * clients (live collaboration — see incidentRoom.ts for why the DO itself
 * holds no incident data). D1 is already the source of truth and the
 * mutation that triggered this has already committed by the time this
 * runs; a DO that's unreachable (cold start race, transient error) must
 * never fail the request that already succeeded — best-effort only.
 */
function broadcastIncidentUpdate(env: Env, incidentId: string, reason: string): Promise<void> {
  const stub = env.INCIDENT_ROOM.get(env.INCIDENT_ROOM.idFromName(incidentId))
  return stub
    .fetch('https://incident-room/broadcast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ incidentId, reason }),
    })
    .then(() => undefined)
    .catch(() => undefined)
}

const app = new Hono<{ Bindings: Env }>()

app.use('*', cors())

app.get('/health', (c) =>
  c.json({ ok: true, service: 'escalate-my-api', intelligence: ['decision', 'regulatory', 'board'] })
)

app.get('/api/v1/regulatory/clocks', (c) => c.json({ clocks: listRegulatoryClocks() }))

/**
 * Who the caller is, per Cloudflare Access — so the frontend can show a real
 * name/avatar instead of a hardcoded "Operator" placeholder, and send it
 * along as the `actor`/`respondent_name` on writes made while Access isn't
 * enabled yet (once it is, the backend's own `resolveIdentity` wins
 * regardless of what the client sends — see @escalate-my/shared/identity).
 */
app.get('/api/v1/me', async (c) => {
  const identity = await resolveIdentity(c.executionCtx)
  return c.json({
    actor: identity.actor,
    email: identity.email,
    verified: identity.verified,
  })
})

/**
 * RBAC — organisation membership + role assignment. Backs onto the `users`
 * table, unused by any route until now (see packages/incidents/src/members.ts).
 * Listing is open to anyone (low sensitivity — knowing who holds which role
 * isn't itself a secret, and it's how a caller learns why they got a 403).
 * Writes require Admin, with a one-time bootstrap: the first member ever
 * added to an organisation needs no existing Admin to add them, or no
 * organisation could ever get off the ground. Every write is inert (no auth
 * required) until Access is verified — see authz.ts's `enforced` flag.
 */
app.get('/api/v1/organisations/:id/members', async (c) => {
  const items = await memberRepo(c.env).list(c.req.param('id'))
  return c.json({ items })
})

app.post('/api/v1/organisations/:id/members', async (c) => {
  const orgId = c.req.param('id')
  const body = await c.req.json<{ email?: string; name?: string; role?: string }>()
  if (!body.email || !body.name || !body.role) {
    return c.json({ error: 'email, name and role are required' }, 400)
  }
  const members = memberRepo(c.env)
  const existingCount = await members.count(orgId)
  if (existingCount > 0) {
    const roleCheck = await checkRole(c.env, c.executionCtx, orgId, [])
    if (!roleCheck.allowed) {
      return c.json({ error: 'Only an Admin can add or change members', your_role: roleCheck.role }, 403)
    }
  }
  const member = await members.upsert(orgId, body.email, body.name, body.role)
  return c.json({ item: member }, 201)
})

app.delete('/api/v1/organisations/:id/members/:email', async (c) => {
  const orgId = c.req.param('id')
  const roleCheck = await checkRole(c.env, c.executionCtx, orgId, [])
  if (!roleCheck.allowed) {
    return c.json({ error: 'Only an Admin can remove members', your_role: roleCheck.role }, 403)
  }
  await memberRepo(c.env).remove(orgId, c.req.param('email'))
  return c.json({ ok: true })
})

/**
 * Audit trail integrity check (migration 0006) — recomputes the hash chain
 * for this organisation and reports the first broken link, if any. Open to
 * any caller: verification is read-only and the point of the feature is
 * transparency, not restricting who can ask "has this been tampered with?".
 */
app.get('/api/v1/organisations/:id/audit/verify', async (c) => {
  const result = await incidentRepo(c.env).verifyAuditChain(c.req.param('id'))
  return c.json(result)
})

/**
 * Organisation settings — backed by the CONFIG KV namespace (see
 * packages/incidents/src/orgSettings.ts), bound in wrangler.jsonc since
 * early on but never actually read or written until now. Read-heavy,
 * rarely-written per-organisation display settings (name, default
 * statement language) — fetched by the frontend instead of defaulting to
 * a hardcoded placeholder organisation name every session. Same write
 * gate as member management: open until Access + roles are actually
 * configured for the organisation, Admin-only once they are.
 */
app.get('/api/v1/organisations/:id/settings', async (c) => {
  const settings = await getOrganisationSettings(c.env, c.req.param('id'))
  return c.json({ item: settings })
})

app.put('/api/v1/organisations/:id/settings', async (c) => {
  const orgId = c.req.param('id')
  const roleCheck = await checkRole(c.env, c.executionCtx, orgId, [])
  if (!roleCheck.allowed) {
    return c.json({ error: 'Only an Admin can change organisation settings', your_role: roleCheck.role }, 403)
  }
  const body = await c.req.json<{ name?: string; default_statement_lang?: 'en' | 'bm' }>()
  const settings = await putOrganisationSettings(c.env, orgId, body)
  return c.json({ item: settings })
})

/**
 * Signal intake — the "orchestration, not monitoring" boundary. External
 * systems an organisation already runs (Meltwater, Sentinel, ServiceNow,
 * Zendesk, Salesforce, a generic webhook — anything that can POST JSON)
 * push a normalized event here. Escalate never duplicates what those
 * systems already do; it classifies the signal with the same rules-only
 * severity heuristic used everywhere else in this product, and holds it
 * as 'pending' until a human explicitly creates or dismisses the
 * incident — see packages/incidents/src/signals.ts for why this is
 * deliberately not auto-promoted.
 *
 * Authenticated by a per-organisation shared secret (CONFIG KV via
 * signalAuth.ts), not Cloudflare Access — an external SaaS webhook can't
 * do an interactive OAuth flow. No key configured for an organisation
 * means every signal to it is rejected; there is no open-by-default path.
 */
app.post('/api/v1/signals', async (c) => {
  const body = await c.req.json<{
    organisation_id?: string
    incident_type?: string
    source?: string
    description?: string
    severity_hint?: string
    timestamp?: string
  }>()
  if (!body.organisation_id || !body.incident_type || !body.source || !body.description) {
    return c.json({ error: 'organisation_id, incident_type, source and description are required' }, 400)
  }

  const authHeader = c.req.header('Authorization') || ''
  const providedKey = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  const authorized = await verifySignalKey(c.env, body.organisation_id, providedKey)
  if (!authorized) {
    return c.json({ error: 'Invalid or missing signal key for this organisation' }, 401)
  }

  const input: SignalInput = {
    incident_type: body.incident_type.slice(0, 100),
    source: body.source.slice(0, 100),
    description: body.description.slice(0, 5000),
    severity_hint: body.severity_hint?.slice(0, 50),
    timestamp: body.timestamp,
  }
  const signal = await signalRepo(c.env).create(body.organisation_id, input)
  await incidentRepo(c.env).writeAudit({
    organisation_id: body.organisation_id,
    actor: input.source,
    action: 'signal.received',
    detail: `${input.incident_type} — ${input.description.slice(0, 200)}`,
  })
  return c.json({ item: signal }, 201)
})

app.get('/api/v1/organisations/:id/signals', async (c) => {
  const status = c.req.query('status')
  const items = await signalRepo(c.env).list(c.req.param('id'), status)
  return c.json({ items })
})

/**
 * Demo-only signal intake — same SignalRepository.create() pipeline as the
 * real POST /api/v1/signals (same rules-based assessment, same
 * pending-until-human-decides posture, same real D1 row), but without the
 * per-organisation signal key. That key exists to authenticate an
 * *external* vendor's webhook; the guided in-app demo walkthrough is this
 * same product triggering its own real pipeline to show a prospect how it
 * behaves, not an external system, so requiring a vendor credential here
 * would just be friction with no real security purpose. Input is capped
 * the same way as the real endpoint.
 */
app.post('/api/v1/demo/signals', async (c) => {
  const body = await c.req.json<{
    organisation_id?: string
    incident_type?: string
    source?: string
    description?: string
    severity_hint?: string
  }>()
  if (!body.organisation_id || !body.incident_type || !body.source || !body.description) {
    return c.json({ error: 'organisation_id, incident_type, source and description are required' }, 400)
  }
  const input: SignalInput = {
    incident_type: body.incident_type.slice(0, 100),
    source: body.source.slice(0, 100),
    description: body.description.slice(0, 5000),
    severity_hint: body.severity_hint?.slice(0, 50),
  }
  const signal = await signalRepo(c.env).create(body.organisation_id, input)
  await incidentRepo(c.env).writeAudit({
    organisation_id: body.organisation_id,
    actor: `${input.source} (demo)`,
    action: 'signal.received',
    detail: `${input.incident_type} — ${input.description.slice(0, 200)}`,
  })
  return c.json({ item: signal }, 201)
})

/** Turns a pending signal into a real incident — the one place a human confirms what every signal source only proposed. */
app.post('/api/v1/signals/:id/action', async (c) => {
  const signalId = c.req.param('id')
  const body = await c.req.json<{ actor?: string }>().catch(() => ({}) as { actor?: string })
  const identity = await resolveIdentity(c.executionCtx)
  const actor = identity.actor || body.actor || 'Operator'

  const signal = await signalRepo(c.env).get(signalId)
  const svc = new IncidentService(c.env)
  let incident = await svc.create({
    organisation_id: signal.organisation_id,
    title: `${signal.source}: ${signal.description}`.slice(0, 140),
    actor,
  })
  if (signal.recommended_severity) {
    await incidentRepo(c.env).updateSeverity(incident.id, signal.recommended_severity)
    incident = { ...incident, severity: signal.recommended_severity }
  }
  const updatedSignal = await signalRepo(c.env).markActioned(signalId, incident.id, actor)
  await incidentRepo(c.env).writeAudit({
    organisation_id: signal.organisation_id,
    incident_id: incident.id,
    actor,
    action: 'signal.actioned',
    detail: `${signal.source} — ${signal.incident_type}`,
  })
  return c.json({ item: updatedSignal, incident }, 201)
})

app.post('/api/v1/signals/:id/dismiss', async (c) => {
  const signalId = c.req.param('id')
  const body = await c.req.json<{ actor?: string }>().catch(() => ({}) as { actor?: string })
  const identity = await resolveIdentity(c.executionCtx)
  const actor = identity.actor || body.actor || 'Operator'

  const signal = await signalRepo(c.env).get(signalId)
  const updatedSignal = await signalRepo(c.env).dismiss(signalId, actor)
  await incidentRepo(c.env).writeAudit({
    organisation_id: signal.organisation_id,
    actor,
    action: 'signal.dismissed',
    detail: `${signal.source} — ${signal.incident_type}`,
  })
  return c.json({ item: updatedSignal })
})

/** Status only — never returns the key itself, so the UI can show "configured" without re-exposing a live secret. */
app.get('/api/v1/organisations/:id/signal-key/status', async (c) => {
  const status = await getSignalKeyStatus(c.env, c.req.param('id'))
  return c.json(status)
})

/** Generates (or replaces) the organisation's signal key. Returned in full exactly once — the caller must copy it immediately. */
app.post('/api/v1/organisations/:id/signal-key/rotate', async (c) => {
  const orgId = c.req.param('id')
  const roleCheck = await checkRole(c.env, c.executionCtx, orgId, [])
  if (!roleCheck.allowed) {
    return c.json({ error: 'Only an Admin can rotate the signal key', your_role: roleCheck.role }, 403)
  }
  const result = await rotateSignalKey(c.env, orgId)
  return c.json(result)
})

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

/**
 * Regulatory Clock™ — start or stop one of the UI's 7 clocks (ClocksModule /
 * verifiedPractice.ts) for an incident. Mapped to the obligation catalog
 * (uiClockMap.ts) so starting a clock creates a real, cron-tracked
 * incident_obligations row with a computed deadline — not just a local flag.
 */
app.post('/api/v1/incidents/:id/clocks/:clockId/toggle', async (c) => {
  const { id: incidentId, clockId } = c.req.param()
  const body = await c.req.json<{ active: boolean; actor?: string }>()
  const obligationId = obligationIdForUiClock(clockId)
  if (!obligationId) {
    return c.json({ error: `Unknown clock id: ${clockId}` }, 400)
  }
  const repo = incidentRepo(c.env)
  const incident = await repo.get(incidentId)
  if (body.active) {
    await startObligationTracking(c.env.DB, incidentId, obligationId)
  } else {
    await stopObligationTracking(c.env.DB, incidentId, obligationId)
  }
  const identity = await resolveIdentity(c.executionCtx)
  await repo.writeAudit({
    organisation_id: incident.organisation_id,
    incident_id: incidentId,
    actor: identity.actor || body.actor || 'Operator',
    action: body.active ? 'regulatory_clock_started' : 'regulatory_clock_stopped',
    detail: clockId,
  })
  c.executionCtx.waitUntil(broadcastIncidentUpdate(c.env, incidentId, 'clock_toggled'))
  return c.json({ ok: true })
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

/** Decision Quorum™ — cast or update one role's vote on an incident. */
app.put('/api/v1/incidents/:id/quorum/:role', async (c) => {
  const { id: incidentId, role } = c.req.param()
  const body = await c.req.json<{ state: string; note?: string; respondent_name?: string; actor?: string }>()
  const validStates = ['pending', 'approved', 'rejected', 'abstain']
  if (!validStates.includes(body.state)) {
    return c.json({ error: `state must be one of ${validStates.join(', ')}` }, 400)
  }
  const repo = incidentRepo(c.env)
  const incident = await repo.get(incidentId)

  // RBAC: once an organisation has members configured, casting a vote AS a
  // given role requires actually holding that role (or Admin) — otherwise
  // identity alone (PR #19) stops spoofed actor names but not spoofed
  // authority, i.e. anyone verified could still vote as "CEO". Inert until
  // both Access is verified and the org has ≥1 member — see authz.ts.
  const roleCheck = await checkRole(c.env, c.executionCtx, incident.organisation_id, [role])
  if (!roleCheck.allowed) {
    return c.json({ error: `Not authorized to vote as ${role}`, your_role: roleCheck.role }, 403)
  }

  const identity = await resolveIdentity(c.executionCtx)
  const respondentName = identity.actor || body.respondent_name
  await repo.upsertQuorumVote(incidentId, role, {
    state: body.state as any,
    note: body.note,
    respondent_name: respondentName,
  })
  await repo.writeAudit({
    organisation_id: incident.organisation_id,
    incident_id: incidentId,
    actor: identity.actor || body.actor || body.respondent_name || role,
    action: 'quorum_vote',
    detail: `${role}: ${body.state}`,
  })
  const quorum = await repo.listQuorum(incidentId)
  c.executionCtx.waitUntil(broadcastIncidentUpdate(c.env, incidentId, 'quorum_vote'))
  return c.json({ items: quorum })
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
  const full = c.req.query('full') === 'true'
  if (!full) return c.json({ items })

  const incidentIds = items.map((item) => item.id)
  const detailRows = await Promise.all(
    incidentIds.map(async (id) => {
      const repo = incidentRepo(c.env)
      const [incident, tasks, quorum, audit, obligationRows] = await Promise.all([
        svc.get(id),
        svc.tasks(id),
        repo.listQuorum(id),
        repo.listAudit(id),
        c.env.DB.prepare(`SELECT obligation_id FROM incident_obligations WHERE incident_id = ?`)
          .bind(id)
          .all<{ obligation_id: string }>(),
      ])
      const clocks: Record<string, boolean> = {}
      for (const row of obligationRows.results ?? []) {
        const clockId = uiClockIdForObligation(row.obligation_id)
        if (clockId) clocks[clockId] = true
      }
      // Same shape as GET /api/v1/incidents/:id/full, one object per
      // incident — not a flattened/guessed shape. `checked` isn't a real
      // column on `incidents` (incident.checked was always undefined here,
      // so every list-view incident silently showed 0 of 13 steps done
      // regardless of actual progress); the frontend already derives it
      // correctly from `tasks` via checkedFromTasks() for the single-incident
      // path (src/core/api.ts's incidentFromFull) — this reuses that same
      // path for the batch one instead of re-deriving it wrong here.
      return { incident, tasks, quorum, audit, clocks }
    })
  )
  return c.json({ items: detailRows })
})

app.post('/api/v1/incidents/:id/save', async (c) => {
  const incidentId = c.req.param('id')
  const body = await c.req.json<{
    incident?: {
      title?: string
      status?: string
      severity?: number | null
      dimension?: string | null
      scenario?: string
      owner?: string | null
      statement?: string
      statement_lang?: string
    }
    tasks?: Array<{ taskId: string; status: string }>
    quorum?: Array<{ role: string; state: string; note?: string | null; respondent_name?: string | null }>
    clocks?: Record<string, boolean>
    actor?: string
  }>()
  const repo = incidentRepo(c.env)
  const identity = await resolveIdentity(c.executionCtx)
  const actor = identity.actor || body.actor || 'Operator'

  if (body.incident) {
    await repo.update(incidentId, {
      title: body.incident.title,
      status: body.incident.status as any,
      severity: body.incident.severity,
      dimension: body.incident.dimension,
      scenario: body.incident.scenario,
      owner: body.incident.owner,
      statement: body.incident.statement,
      statement_lang: body.incident.statement_lang,
    })
    const before = await repo.get(incidentId)
    await repo.writeAudit({
      organisation_id: before.organisation_id,
      incident_id: incidentId,
      actor,
      action: 'incident.updated',
      detail: 'bulk-save',
    })
  }

  if (body.tasks && body.tasks.length > 0) {
    for (const task of body.tasks) {
      await repo.updateTaskStatus(task.taskId, task.status as any)
    }
  }

  if (body.quorum && body.quorum.length > 0) {
    for (const vote of body.quorum) {
      await repo.upsertQuorumVote(incidentId, vote.role, {
        state: vote.state as any,
        note: vote.note ?? null,
        respondent_name: vote.respondent_name ?? null,
      })
    }
  }

  if (body.clocks) {
    for (const [clockId, active] of Object.entries(body.clocks)) {
      const obligationId = obligationIdForUiClock(clockId)
      if (!obligationId) continue
      if (active) await startObligationTracking(c.env.DB, incidentId, obligationId)
      else await stopObligationTracking(c.env.DB, incidentId, obligationId)
    }
  }

  c.executionCtx.waitUntil(broadcastIncidentUpdate(c.env, incidentId, 'incident_saved'))
  return c.json({ ok: true, item: await repo.get(incidentId) })
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
    app_version?: string
  }>()
  if (!body.organisation_id || !body.title) return c.json({ error: 'organisation_id and title required' }, 400)
  const svc = new IncidentService(c.env)
  const identity = await resolveIdentity(c.executionCtx)
  const appVersion =
    typeof body.app_version === 'string' && /^[a-f0-9]{7,40}$/i.test(body.app_version)
      ? body.app_version.slice(0, 7)
      : undefined
  const item = await svc.create({ ...body, app_version: appVersion, actor: identity.actor || body.actor })
  return c.json({ item }, 201)
})

app.post('/api/v1/incidents/:id/close', async (c) => {
  const incidentId = c.req.param('id')
  const body = await c.req.json<{ actor?: string }>().catch(() => ({}) as { actor?: string })
  const svc = new IncidentService(c.env)

  // RBAC: closing an incident is a governance action, not a status update —
  // restricted to the roles that actually own that call. Inert (see
  // authz.ts) until the organisation has members configured.
  const before = await svc.get(incidentId)
  const roleCheck = await checkRole(c.env, c.executionCtx, before.organisation_id, [
    'CEO',
    'Crisis Lead',
    'Company Secretary',
  ])
  if (!roleCheck.allowed) {
    return c.json({ error: 'Not authorized to close this incident', your_role: roleCheck.role }, 403)
  }

  const identity = await resolveIdentity(c.executionCtx)
  const item = await svc.close(incidentId, identity.actor || body.actor)
  return c.json({ item })
})

/** Update any mutable field on an incident (severity, status, statement, owner, dimension, scenario, title). */
app.patch('/api/v1/incidents/:id', async (c) => {
  const incidentId = c.req.param('id')
  const body = await c.req.json<{
    title?: string
    status?: string
    severity?: number | null
    dimension?: string | null
    scenario?: string
    owner?: string | null
    statement?: string
    statement_lang?: string
    actor?: string
  }>()
  const validStatuses = ['open', 'monitoring', 'contained', 'closed']
  if (body.status !== undefined && !validStatuses.includes(body.status)) {
    return c.json({ error: `status must be one of ${validStatuses.join(', ')}` }, 400)
  }
  const repo = incidentRepo(c.env)
  const before = await repo.get(incidentId)
  const item = await repo.update(incidentId, {
    title: body.title,
    status: body.status as any,
    severity: body.severity,
    dimension: body.dimension,
    scenario: body.scenario,
    owner: body.owner,
    statement: body.statement,
    statement_lang: body.statement_lang,
  })
  const identity = await resolveIdentity(c.executionCtx)
  await repo.writeAudit({
    organisation_id: before.organisation_id,
    incident_id: incidentId,
    actor: identity.actor || body.actor || 'Operator',
    action: 'incident.updated',
    detail: Object.keys(body)
      .filter((k) => k !== 'actor')
      .join(', '),
  })
  c.executionCtx.waitUntil(broadcastIncidentUpdate(c.env, incidentId, 'incident_updated'))
  return c.json({ item })
})

/**
 * Composite read for the real frontend (src/core/api.ts): one call that
 * assembles everything its local Incident shape needs — the incident row,
 * its 13 First Sixty Minutes tasks, quorum votes, and audit trail — instead
 * of the frontend hand-rolling four separate fetches.
 */
app.get('/api/v1/incidents/:id/full', async (c) => {
  const incidentId = c.req.param('id')
  const svc = new IncidentService(c.env)
  const repo = incidentRepo(c.env)
  const [incident, tasks, quorum, audit, obligationRows] = await Promise.all([
    svc.get(incidentId),
    svc.tasks(incidentId),
    repo.listQuorum(incidentId),
    repo.listAudit(incidentId),
    c.env.DB.prepare(`SELECT obligation_id FROM incident_obligations WHERE incident_id = ?`)
      .bind(incidentId)
      .all<{ obligation_id: string }>(),
  ])
  const clocks: Record<string, boolean> = {}
  for (const row of obligationRows.results ?? []) {
    const clockId = uiClockIdForObligation(row.obligation_id)
    if (clockId) clocks[clockId] = true
  }
  return c.json({ incident, tasks, quorum, audit, clocks })
})

/**
 * Live collaboration — upgrades to a WebSocket on this incident's
 * IncidentRoom Durable Object. Presence + "something changed, refetch"
 * pushes only; clients still read real data from GET .../full. See
 * incidentRoom.ts for why.
 */
app.get('/api/v1/incidents/:id/live', async (c) => {
  const incidentId = c.req.param('id')
  const stub = c.env.INCIDENT_ROOM.get(c.env.INCIDENT_ROOM.idFromName(incidentId))
  const url = new URL(c.req.url)
  url.searchParams.set('room', incidentId)
  const identity = await resolveIdentity(c.executionCtx)
  if (identity.actor) url.searchParams.set('name', identity.actor)
  return stub.fetch(new Request(url, c.req.raw))
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

/** Check/uncheck one First Sixty Minutes step. */
app.patch('/api/v1/incidents/:id/tasks/:taskId', async (c) => {
  const { id: incidentId, taskId } = c.req.param()
  const body = await c.req.json<{ status: string; actor?: string }>()
  const validStatuses = ['pending', 'in_progress', 'done', 'skipped']
  if (!validStatuses.includes(body.status)) {
    return c.json({ error: `status must be one of ${validStatuses.join(', ')}` }, 400)
  }
  const repo = incidentRepo(c.env)
  const incident = await repo.get(incidentId)
  const task = await repo.updateTaskStatus(taskId, body.status as any)
  const identity = await resolveIdentity(c.executionCtx)
  await repo.writeAudit({
    organisation_id: incident.organisation_id,
    incident_id: incidentId,
    actor: identity.actor || body.actor || 'Operator',
    action: 'first60_task_updated',
    detail: `Langkah ${task.step_index}: "${task.title}" -> ${body.status}`,
  })
  c.executionCtx.waitUntil(broadcastIncidentUpdate(c.env, incidentId, 'task_updated'))
  return c.json({ item: task })
})

app.post('/api/v1/holding-statements', async (c) => {
  const body = await c.req.json<{
    scenario: string
    company: string
    issue: string
    lang?: 'en' | 'bm' | 'both'
    facts?: string
  }>()
  const svc = new IncidentService(c.env)
  const result = await svc.holding({
    scenario: body.scenario || 'operational',
    company: body.company || 'Company',
    issue: body.issue || '[issue]',
    lang: body.lang || 'both',
    facts: body.facts,
  })
  return c.json(result)
})

app.get('/api/v1/approved-responses/types', async (c) => {
  const audience = c.req.query('audience') as any
  const svc = new IncidentService(c.env)
  return c.json({ items: svc.approvedResponseTypes(audience) })
})

app.post('/api/v1/approved-responses', async (c) => {
  const body = await c.req.json<{
    incident_id: string
    type: string
    lang?: 'en' | 'bm' | 'both'
    company: string
    product_name?: string
  }>()
  if (!body.incident_id || !body.type || !body.company) {
    return c.json({ error: 'incident_id, type and company required' }, 400)
  }
  const svc = new IncidentService(c.env)
  const result = await svc.approvedResponse({
    incidentId: body.incident_id,
    type: body.type as any,
    lang: body.lang || 'both',
    company: body.company,
    productName: body.product_name,
  })
  return c.json(result)
})

app.post('/api/v1/reports/board-brief', async (c) => {
  const body = await c.req.json<{ incident_id: string; kind?: string; actor?: string }>()
  if (!body.incident_id) return c.json({ error: 'incident_id required' }, 400)
  const svc = new IncidentService(c.env)
  const incident = await svc.get(body.incident_id)
  const kind = (body.kind as any) || 'situation_report'
  const identity = await resolveIdentity(c.executionCtx)
  const result = await generateAndStoreBrief(c.env, incident, kind, identity.actor || body.actor)
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

