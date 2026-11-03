export interface Env {
  DB?: D1Database;
  REPORTS?: R2Bucket;
  CACHE?: KVNamespace;
  INCIDENT_API_TOKEN?: string;
}
