-- Regulatory Clock™ — per-incident obligation tracking + cron escalation
--
-- The obligation catalog (regulatory_obligations) describes what rules exist.
-- This migration adds the missing piece: tracking WHICH obligation applies to
-- WHICH incident, and WHEN its deadline falls, so a scheduled Worker can flag
-- approaching/passed deadlines automatically instead of relying on someone to
-- remember to check.

ALTER TABLE regulatory_obligations ADD COLUMN deadline_hours INTEGER;

-- Only obligations with an unambiguous, counsel-verified numeric deadline get
-- a deadline_hours value. Obligations whose wording is not a fixed window
-- ("as soon as reasonably practicable", "per applicable rules") stay NULL —
-- the cron only tracks what it can compute; everything else remains a manual
-- Regulatory Clock review, same as today.
UPDATE regulatory_obligations SET deadline_hours = 0   WHERE id = 'obl_bursa_903'; -- immediate
UPDATE regulatory_obligations SET deadline_hours = 0   WHERE id = 'obl_bursa_911'; -- as soon as practicable, treated as immediate
UPDATE regulatory_obligations SET deadline_hours = 72  WHERE id = 'obl_pdpa_72';   -- 72 hours from awareness
UPDATE regulatory_obligations SET deadline_hours = 168 WHERE id = 'obl_dosh_nado'; -- written report within 7 days

CREATE TABLE incident_obligations (
  id TEXT PRIMARY KEY,
  incident_id TEXT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  obligation_id TEXT NOT NULL REFERENCES regulatory_obligations(id),
  match_score INTEGER NOT NULL DEFAULT 0,
  triggered_at TEXT NOT NULL,
  deadline_at TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | escalated | met | not_applicable
  escalated_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (incident_id, obligation_id)
);

CREATE INDEX idx_incident_obl_incident ON incident_obligations(incident_id);
CREATE INDEX idx_incident_obl_pending_deadline ON incident_obligations(status, deadline_at);
