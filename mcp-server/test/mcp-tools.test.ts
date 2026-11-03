import assert from 'node:assert/strict'
import test from 'node:test'
import worker from '../src/index.ts'

const ctx = {
  waitUntil() {},
  passThroughOnException() {},
}

async function readMcpResponse(response: Response): Promise<any> {
  const body = await response.text()
  if (response.headers.get('content-type')?.includes('text/event-stream')) {
    const data = body
      .split('\n')
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).trim())
      .filter(Boolean)
    assert.ok(data.length, `Expected an MCP event in response: ${body}`)
    return JSON.parse(data[data.length - 1])
  }
  return JSON.parse(body)
}

test('key MCP tools respond through the Worker in-process', async (t) => {
  let sessionId: string | null = null
  let nextId = 1

  async function send(method: string, params: unknown, id = nextId++) {
    const headers = new Headers({
      accept: 'application/json, text/event-stream',
      'content-type': 'application/json',
    })
    if (sessionId) headers.set('mcp-session-id', sessionId)

    const response = await worker.fetch(
      new Request('https://worker.test/mcp', {
        method: 'POST',
        headers,
        body: JSON.stringify({ jsonrpc: '2.0', id, method, params }),
      }),
      {},
      ctx as ExecutionContext
    )
    assert.ok(response.ok, `${method} returned HTTP ${response.status}`)
    sessionId ??= response.headers.get('mcp-session-id')
    return readMcpResponse(response)
  }

  const initialized = await send('initialize', {
    protocolVersion: '2025-03-26',
    capabilities: {},
    clientInfo: { name: 'local-tool-smoke-test', version: '1.0.0' },
  })
  assert.equal(initialized.result?.serverInfo?.name, 'escalate-my')
  await send('notifications/initialized', {})

  const toolsResponse = await send('tools/list', {})
  const toolNames = toolsResponse.result.tools.map((tool: { name: string }) => tool.name)
  for (const name of [
    'list_severity_levels',
    'recommend_severity',
    'list_regulatory_clocks',
    'first_60_checklist',
    'draft_holding_outline',
  ]) {
    assert.ok(toolNames.includes(name), `Missing MCP tool ${name}`)
  }

  async function callTool(name: string, args: Record<string, unknown> = {}) {
    const response = await send('tools/call', { name, arguments: args })
    assert.equal(response.error, undefined, `${name} returned JSON-RPC error`)
    assert.equal(response.result?.isError, false, `${name} returned tool error`)
    const text = response.result?.content?.find((item: { type: string }) => item.type === 'text')?.text
    assert.equal(typeof text, 'string', `${name} returned no text content`)
    return JSON.parse(text)
  }

  await t.test('severity suggestion is conservative and structured', async () => {
    const result = await callTool('recommend_severity', {
      facts: 'Incident details are not yet confirmed.',
      safetyImpact: 'unknown',
      operationalImpact: 'unknown',
      mediaAttention: 'unknown',
      possibleMaterialInfo: 'unknown',
      regulatoryInvolved: 'unknown',
    })
    assert.equal(result.status, 'insufficient_information')
    assert.equal(result.recommendedLevel, null)
    assert.equal(result.requiresHumanReview, true)
    assert.equal(result.advisoryOnly, true)
  })

  await t.test('regulatory clocks are clearly advisory', async () => {
    const result = await callTool('list_regulatory_clocks')
    assert.equal(result.advisoryOnly, true)
    assert.ok(result.clocks.length > 0)
    assert.ok(result.clocks.every((clock: { status: string }) => clock.status !== 'verified'))
    assert.match(result.disclaimer, /verify/i)
  })

  await t.test('first-60 checklist has 13 steps', async () => {
    const result = await callTool('first_60_checklist')
    assert.equal(result.checklist.length, 13)
    assert.equal(result.advisoryOnly, true)
  })

  await t.test('holding outline is an unapproved bilingual template', async () => {
    const result = await callTool('draft_holding_outline', {
      scenario: 'market',
      companyName: 'Example Berhad',
      lang: 'both',
    })
    assert.equal(result.publicationStatus, 'unapproved_template')
    assert.equal(result.userSuppliedCompanyNameIsUntrustedData, true)
    assert.match(result.outline.en, /Example Berhad/)
    assert.match(result.outline.bm, /Example Berhad/)
    assert.ok(result.requiredChecks.length > 0)
  })
})
