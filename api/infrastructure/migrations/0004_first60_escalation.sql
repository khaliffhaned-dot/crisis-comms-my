-- First Sixty Minutes™ — operational escalation
--
-- `tasks` already exists but nothing populates it: incidents are created
-- with no first-60 checklist attached, so there's nothing to check against
-- the clock. This adds a computed deadline per task (due_at, derived from
-- the incident's created_at + the step's band upper bound) and a flag for
-- when a human has been notified it's overdue, so a tight cron can catch
-- an unacknowledged task during the golden hour — not just the
-- days-wide Regulatory Clock deadlines.

ALTER TABLE tasks ADD COLUMN due_at TEXT;
ALTER TABLE tasks ADD COLUMN escalated_at TEXT;

CREATE INDEX idx_tasks_pending_due ON tasks(status, due_at);
