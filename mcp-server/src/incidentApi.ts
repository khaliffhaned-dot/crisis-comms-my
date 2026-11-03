import type { Env } from '../env';
import type { CreateIncidentInput, Incident } from '../types/incident';
import {
  closeIncidentTool,
  createIncidentTool,
  getIncidentTool,
  listActiveIncidentsTool,
} from './tools/index';
import { upsertClientIncident } from './services/incidentService';

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

function authorized(request: Request, env: Env): boolean {
  const configuredToken = env.INCIDENT_API_TOKEN;
  const authorization = request.headers.get('Authorization') ?? '';
  const match = /^Bearer ([^\s]+)$/.exec(authorization);
  const supplied = match?.[1];
  if (!configuredToken || !supplied || supplied.length !== configuredToken.length) return false;

  let difference = 0;
  for (let i = 0; i < configuredToken.length; i++) {
    difference |= configuredToken.charCodeAt(i) ^ supplied.charCodeAt(i);
  }
  return difference === 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

async function readJson(request: Request): Promise<unknown | null> {
  const contentType = request.headers.get('Content-Type')?.split(';', 1)[0].trim().toLowerCase();
  if (contentType !== 'application/json') return null;
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function readCreateInput(value: unknown): CreateIncidentInput | null {
  if (!isRecord(value)) return null;
  const { title, description, severity } = value;
  if (typeof title !== 'string' || title.trim().length === 0 || title.length > 200) return null;
  if (typeof severity !== 'string' || severity.trim().length === 0 || severity.length > 40) return null;
  if (description !== undefined && description !== null && (typeof description !== 'string' || description.length > 10000)) return null;
  return {
    title: title.trim(),
    severity: severity.trim(),
    description: typeof description === 'string' ? description.trim() : null,
  };
}

function apiIncident(incident: Incident): unknown {
  if (incident.client_payload) {
    try {
      return JSON.parse(incident.client_payload);
    } catch {
      // Ignore corrupt optional payload and return the stable database contract.
    }
  }
  const { client_payload: _payload, ...publicIncident } = incident;
  return publicIncident;
}

export async function handleIncidentApi(request: Request, env: Env): Promise<Response> {
  if (!env.INCIDENT_API_TOKEN) return json({ error: 'Incident API is not configured.' }, 503);
  if (!authorized(request, env)) return json({ error: 'Unauthorized.' }, 401);
  if (!env.DB) return json({ error: 'Incident database is not configured.' }, 503);

  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '') || '/';
  if (path === '/api/incidents' && request.method === 'GET') {
    const incidents = await listActiveIncidentsTool(env);
    return json({ incidents: incidents.map(apiIncident) });
  }
  if (path === '/api/incidents' && request.method === 'POST') {
    const input = readCreateInput(await readJson(request));
    if (!input) return json({ error: 'Send JSON with a title (max 200 chars), severity (max 40 chars), and optional description (max 10000 chars).' }, 400);
    return json({ incident: apiIncident(await createIncidentTool(env, input)) }, 201);
  }

  const match = path.match(/^\/api\/incidents\/([^/]+)(?:\/(close))?$/);
  if (!match) return json({ error: 'Not found.' }, 404);
  let id: string;
  try {
    id = decodeURIComponent(match[1]);
  } catch {
    return json({ error: 'Invalid incident ID.' }, 400);
  }

  if (request.method === 'PUT' && !match[2]) {
    if (!id || id.length > 120 || !/^[\w.-]+$/.test(id)) return json({ error: 'Invalid incident ID.' }, 400);
    const payload = await readJson(request);
    if (!isRecord(payload) || payload.id !== id || typeof payload.title !== 'string' || !payload.title.trim() || payload.title.length > 200) {
      return json({ error: 'Send a valid incident object whose id matches the URL and whose title is 1–200 characters.' }, 400);
    }
    let encoded: string;
    try {
      encoded = JSON.stringify(payload);
    } catch {
      return json({ error: 'Invalid incident payload.' }, 400);
    }
    if (encoded.length > 50000) return json({ error: 'Incident payload exceeds the 50000 character limit.' }, 413);
    const incident = await upsertClientIncident(env, id, payload, encoded);
    return json({ incident: apiIncident(incident) });
  }

  if (request.method === 'GET' && !match[2]) {
    const incident = await getIncidentTool(env, id);
    return incident ? json({ incident: apiIncident(incident) }) : json({ error: 'Incident not found.' }, 404);
  }
  if (request.method === 'POST' && match[2] === 'close') {
    const incident = await closeIncidentTool(env, id);
    return incident ? json({ incident: apiIncident(incident) }) : json({ error: 'Incident not found.' }, 404);
  }
  return json({ error: 'Not found.' }, 404);
}
