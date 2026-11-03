import type { Env } from './env';
import type { CreateIncidentInput, Incident } from './types/incident';
import {
  closeIncidentTool,
  createIncidentTool,
  getIncidentTool,
  listActiveIncidentsTool,
} from './tools/index';
import { upsertClientIncident } from './services/incidentService';

function requestId(): string {
  return crypto.randomUUID();
}

function json(body: unknown, status = 200, requestIdValue = requestId()) {
  return Response.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Request-Id': requestIdValue,
    },
  });
}

function apiError(code: string, message: string, status: number, requestIdValue: string) {
  return json({ error: message, code, request_id: requestIdValue }, status, requestIdValue);
}

function authorized(request: Request, env: Env): boolean {
  const configuredToken = env.INCIDENT_API_TOKEN;
  const authorization = request.headers.get('Authorization') ?? '';
  const match = /^Bearer (\S+)$/.exec(authorization);
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
  const requestIdValue = request.headers.get('X-Request-Id') ?? requestId();

  if (!env.INCIDENT_API_TOKEN) return apiError('incident_api_not_configured', 'Incident API is not configured.', 503, requestIdValue);
  if (!authorized(request, env)) return apiError('unauthorized', 'Unauthorized.', 401, requestIdValue);
  if (!env.DB) return apiError('incident_db_not_configured', 'Incident database is not configured.', 503, requestIdValue);

  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '') || '/';
  if (path === '/api/incidents' && request.method === 'GET') {
    const incidents = await listActiveIncidentsTool(env);
    return json({ incidents: incidents.map(apiIncident), request_id: requestIdValue }, 200, requestIdValue);
  }
  if (path === '/api/incidents' && request.method === 'POST') {
    const input = readCreateInput(await readJson(request));
    if (!input) {
      return apiError('invalid_create_payload', 'Send JSON with a title (max 200 chars), severity (max 40 chars), and optional description (max 10000 chars).', 400, requestIdValue);
    }
    return json({ incident: apiIncident(await createIncidentTool(env, input)), request_id: requestIdValue }, 201, requestIdValue);
  }

  const match = path.match(/^\/api\/incidents\/([^/]+)(?:\/(close))?$/);
  if (!match) return apiError('not_found', 'Not found.', 404, requestIdValue);

  let id: string;
  try {
    id = decodeURIComponent(match[1]);
  } catch {
    return apiError('invalid_incident_id', 'Invalid incident ID.', 400, requestIdValue);
  }

  if (request.method === 'PUT' && !match[2]) {
    if (!id || id.length > 120 || !/^[\w.-]+$/.test(id)) {
      return apiError('invalid_incident_id', 'Invalid incident ID.', 400, requestIdValue);
    }
    const payload = await readJson(request);
    if (!isRecord(payload) || payload.id !== id || typeof payload.title !== 'string' || !payload.title.trim() || payload.title.length > 200) {
      return apiError('invalid_update_payload', 'Send a valid incident object whose id matches the URL and whose title is 1–200 characters.', 400, requestIdValue);
    }
    let encoded: string;
    try {
      encoded = JSON.stringify(payload);
    } catch {
      return apiError('invalid_payload', 'Invalid incident payload.', 400, requestIdValue);
    }
    if (encoded.length > 50000) {
      return apiError('payload_too_large', 'Incident payload exceeds the 50000 character limit.', 413, requestIdValue);
    }
    const incident = await upsertClientIncident(env, id, payload, encoded);
    return json({ incident: apiIncident(incident), request_id: requestIdValue }, 200, requestIdValue);
  }

  if (request.method === 'GET' && !match[2]) {
    const incident = await getIncidentTool(env, id);
    if (!incident) return apiError('incident_not_found', 'Incident not found.', 404, requestIdValue);
    return json({ incident: apiIncident(incident), request_id: requestIdValue }, 200, requestIdValue);
  }
  if (request.method === 'POST' && match[2] === 'close') {
    const incident = await closeIncidentTool(env, id);
    if (!incident) return apiError('incident_not_found', 'Incident not found.', 404, requestIdValue);
    return json({ incident: apiIncident(incident), request_id: requestIdValue }, 200, requestIdValue);
  }

  return apiError('not_found', 'Not found.', 404, requestIdValue);
}
