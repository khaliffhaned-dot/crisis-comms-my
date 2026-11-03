import assert from 'node:assert/strict';
import test from 'node:test';
import worker from '../src/worker.ts';

const ctx = {
  waitUntil() {},
  passThroughOnException() {},
} as ExecutionContext;

test('incident API paths are routed to the authenticated API handler', async () => {
  const response = await worker.fetch(
    new Request('https://worker.test/api/incidents'),
    {},
    ctx,
  );
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: 'Incident API is not configured.' });
});

test('unmatched paths continue through to the MCP worker', async () => {
  const response = await worker.fetch(
    new Request('https://worker.test/not-an-endpoint'),
    {},
    ctx,
  );
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { name: 'escalate-my-mcp', mcp: '/mcp' });
});
