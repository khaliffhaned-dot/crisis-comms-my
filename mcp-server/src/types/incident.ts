export type IncidentStatus = 'ACTIVE' | 'CLOSED';

export interface Incident {
  id: string;
  title: string;
  description: string | null;
  severity: string;
  status: IncidentStatus;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  /** Optional serialized frontend domain model; never returned as a raw string by the API. */
  client_payload?: string | null;
}

export interface CreateIncidentInput {
  title: string;
  description?: string | null;
  severity: string;
}
