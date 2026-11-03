import type { Env } from '../env';
import { listActiveIncidents } from '../services/incidentService';

export function listActiveIncidentsTool(env: Env) {
  return listActiveIncidents(env);
}
