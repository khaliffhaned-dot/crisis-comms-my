import type { Env } from './env';
import type { CreateIncidentInput } from './types/incident';
import {
  closeIncidentTool,
  createIncidentTool,
  getIncidentTool,
  listActiveIncidentsTool,
} from './tools/index';

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

function authorized(request: Request, env: Env): boolean {
  const configuredToken = env.INCIDENT_API_TOKEN;
  const supplied = request.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
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

async function readCreateInput(request: Request): Promise<CreateIncidentInput | null> {
  let value: unknown;
  try {
    value = await request.json();
  } catch {
    return null;
  }
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

export async function handleIncidentApi(request: Request, env: Env): Promise<Response> {
  if (!env.INCIDENT_API_TOKEN) {
    return json({ error: 'Incident API is not configured.' }, 503);
  }
  if (!authorized(request, env)) return json({ error: 'Unauthorized.' }, 401);

  const url = new URL(request.url);
  const path = url.pathname.replace(/\/$/, '');
  if (path === '/api/incidents' && request.method === 'GET') {
    return json({ incidents: await listActiveIncidentsTool(env) });
  }
  if (path === '/api/incidents' && request.method === 'POST') {
    const input = await readCreateInput(request);
    if (!input) return json({ error: 'Provide a title (max 200 chars), severity (max 40 chars), and optional description (max 10000 chars).' }, 400);
    return json({ incident: await createIncidentTool(env, input) }, 201);
  }

  const match = path.match(/^\/api\/incidents\/([^/]+)(?:\/(close))?$/);
  if (match && request.method === 'GET' && !match[2]) {
    const incident = await getIncidentTool(env, decodeURIComponent(match[1]));
    return incident ? json({ incident }) : json({ error: 'Incident not found.' }, 404);
  }
  if (match && request.method === 'POST' && match[2] === 'close') {
    const incident = await closeIncidentTool(env, decodeURIComponent(match[1]));
    return incident ? json({ incident }) : json({ error: 'Incident not found.' }, 404);
  }
  return json({ error: 'Not found.' }, 404);
}
