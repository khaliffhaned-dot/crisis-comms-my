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
  const appVersion = typeof body.app_version === 'string' && /^[a-f0-9]{7,40}$/i.test(body.app_version)
    ? body.app_version.slice(0, 7)
    : undefined
  const item = await svc.create({ ...body, app_version: appVersion, actor: identity.actor || body.actor })
  return c.json({ item }, 201)
})
