import type { Env } from '../env';
import { createIncident } from '../services/incidentService';
import type { CreateIncidentInput } from '../types/incident';

export function createIncidentTool(env: Env, input: CreateIncidentInput) {
  return createIncident(env, input);
}
