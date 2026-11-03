import type { Env } from '../env';
import type { CreateIncidentInput, Incident } from '../types/incident';

export async function createIncident(env: Env, input: CreateIncidentInput): Promise<Incident> {
  const id = crypto.randomUUID();
  await env.DB.prepare(
    `INSERT INTO incidents (id, title, description, severity, status)
     VALUES (?, ?, ?, ?, 'ACTIVE')`,
  ).bind(id, input.title, input.description ?? null, input.severity).run();

  const incident = await getIncident(env, id);
  if (!incident) throw new Error('Incident was created but could not be read back.');
  return incident;
}

export async function getIncident(env: Env, id: string): Promise<Incident | null> {
  return env.DB.prepare('SELECT * FROM incidents WHERE id = ?')
    .bind(id)
    .first<Incident>();
}

export async function listActiveIncidents(env: Env): Promise<Incident[]> {
  const result = await env.DB.prepare(
    "SELECT * FROM incidents WHERE status = 'ACTIVE' ORDER BY created_at DESC",
  ).all<Incident>();
  return result.results;
}

export async function closeIncident(env: Env, id: string): Promise<Incident | null> {
  await env.DB.prepare(
    `UPDATE incidents
     SET status = 'CLOSED', updated_at = CURRENT_TIMESTAMP, closed_at = CURRENT_TIMESTAMP
     WHERE id = ? AND status = 'ACTIVE'`,
  ).bind(id).run();
  return getIncident(env, id);
}
