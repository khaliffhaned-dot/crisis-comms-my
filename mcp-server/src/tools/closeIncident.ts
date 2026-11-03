import type { Env } from '../env';
import { closeIncident } from '../services/incidentService';

export function closeIncidentTool(env: Env, id: string) {
  return closeIncident(env, id);
}
