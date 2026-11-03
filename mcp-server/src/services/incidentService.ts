import type { Env } from '../env';
import type { CreateIncidentInput, Incident } from '../types/incident';

function requireDatabase(env: Env): D1Database {
  if (!env.DB) throw new Error('D1 database binding DB is not configured.');
  return env.DB;
}

export async function createIncident(env: Env, input: CreateIncidentInput): Promise<Incident> {
  const db = requireDatabase(env);
  const id = crypto.randomUUID();
  await db.prepare(
    `INSERT INTO incidents (id, title, description, severity, status)
     VALUES (?, ?, ?, ?, 'ACTIVE')`,
  ).bind(id, input.title, input.description ?? null, input.severity).run();

  const incident = await getIncident(env, id);
  if (!incident) throw new Error('Incident was created but could not be read back.');
  return incident;
}

/** Persist the frontend's complete incident model while retaining indexed API fields. */
export async function upsertClientIncident(
  env: Env,
  id: string,
  payload: Record<string, unknown>,
  encodedPayload: string,
): Promise<Incident> {
  const db = requireDatabase(env);
  const severity = payload.severity == null ? 'UNSET' : `L${String(payload.severity).replace(/^L/i, '')}`;
  const closed = payload.status === 'closed';
  const status = closed ? 'CLOSED' : 'ACTIVE';
  const description = typeof payload.description === 'string' ? payload.description : null;

  await db.prepare(
    `INSERT INTO incidents (id, title, description, severity, status, client_payload, closed_at)
     VALUES (?, ?, ?, ?, ?, ?, CASE WHEN ? = 'CLOSED' THEN CURRENT_TIMESTAMP ELSE NULL END)
     ON CONFLICT(id) DO UPDATE SET
       title = excluded.title,
       description = excluded.description,
       severity = excluded.severity,
       status = excluded.status,
       client_payload = excluded.client_payload,
       updated_at = CURRENT_TIMESTAMP,
       closed_at = CASE WHEN excluded.status = 'CLOSED' THEN COALESCE(incidents.closed_at, CURRENT_TIMESTAMP) ELSE NULL END`,
  ).bind(id, String(payload.title).trim(), description, severity, status, encodedPayload, status).run();

  const incident = await getIncident(env, id);
  if (!incident) throw new Error('Incident was saved but could not be read back.');
  return incident;
}

export async function getIncident(env: Env, id: string): Promise<Incident | null> {
  return requireDatabase(env).prepare('SELECT * FROM incidents WHERE id = ?')
    .bind(id)
    .first<Incident>();
}

export async function listActiveIncidents(env: Env): Promise<Incident[]> {
  const result = await requireDatabase(env).prepare(
    "SELECT * FROM incidents WHERE status = 'ACTIVE' ORDER BY created_at DESC",
  ).all<Incident>();
  return result.results;
}

export async function closeIncident(env: Env, id: string): Promise<Incident | null> {
  const db = requireDatabase(env);
  await db.prepare(
    `UPDATE incidents
     SET status = 'CLOSED', updated_at = CURRENT_TIMESTAMP, closed_at = CURRENT_TIMESTAMP
     WHERE id = ? AND status = 'ACTIVE'`,
  ).bind(id).run();
  return getIncident(env, id);
}
