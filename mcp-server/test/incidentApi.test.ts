import type { Env } from '../src/env';
import { handleIncidentApi } from '../src/incidentApi';

const token = 'test-secret-token';
const env = { INCIDENT_API_TOKEN: token, DB: {} as D1Database } as Env;
const auth = { Authorization: `Bearer ${token}` };

function request(path: string, init: RequestInit = {}) {
  return new Request(`https://worker.example${path}`, init);
}

async function run() {
  const missingSecret = await handleIncidentApi(request('/api/incidents'), {} as Env);
  if (missingSecret.status !== 503) throw new Error('Missing secret should disable the API.');

  const unauthorized = await handleIncidentApi(request('/api/incidents'), env);
  if (unauthorized.status !== 401) throw new Error('Requests without a bearer token must be denied.');

  const invalidJson = await handleIncidentApi(request('/api/incidents', {
    method: 'POST',
    headers: { ...auth, 'Content-Type': 'application/json' },
    body: '{invalid',
  }), env);
  if (invalidJson.status !== 400) throw new Error('Invalid JSON should return 400.');

  const missingContentType = await handleIncidentApi(request('/api/incidents', {
    method: 'POST',
    headers: auth,
    body: JSON.stringify({ title: 'test', severity: 'L1' }),
  }), env);
  if (missingContentType.status !== 400) throw new Error('Missing JSON content type should return 400.');

  const unknownRoute = await handleIncidentApi(request('/api/unknown', { headers: auth }), env);
  if (unknownRoute.status !== 404) throw new Error('Unknown routes should return 404.');

  console.log('Incident API checks passed.');
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
