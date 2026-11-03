import type { Env } from '../env';
import { getIncident } from '../services/incidentService';

export function getIncidentTool(env: Env, id: string) {
  return getIncident(env, id);
}
