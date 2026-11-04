-- Signal intake: external systems (Meltwater, Sentinel, ServiceNow, Zendesk,
-- Salesforce, a generic webhook, …) POST a normalized event here. A signal
-- is never auto-promoted to an incident — it sits as 'pending' until a
-- human reviews the rules-based recommended severity and explicitly
-- creates (or dismisses) the incident. Same "recommendations only" posture
-- as severity classification and holding-statement drafting elsewhere in
-- this product.
CREATE TABLE signals (
  id TEXT PRIMARY KEY,
  organisation_id TEXT NOT NULL REFERENCES organisations(id),
  source TEXT NOT NULL,
  incident_type TEXT NOT NULL,
  description TEXT NOT NULL,
  severity_hint TEXT,
  recommended_severity INTEGER,
  occurred_at TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | actioned | dismissed
  incident_id TEXT REFERENCES incidents(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT,
  resolved_by TEXT
);

CREATE INDEX idx_signals_org_status ON signals(organisation_id, status);
