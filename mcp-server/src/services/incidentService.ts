import type { Env } from './env';
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
