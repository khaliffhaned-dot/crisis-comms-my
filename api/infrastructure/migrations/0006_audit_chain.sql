-- Audit trail tamper-evidence — hash-chaining per organisation.
--
-- audit_log already exists and is written on every mutation (quorum vote,
-- task/clock/incident update, close, brief generation), but a row could
-- always be edited or deleted directly in D1 with nothing to show it. Each
-- row now carries a SHA-256 hash of its own content plus the previous
-- row's hash (scoped per organisation, chained by insertion order) — any
-- edit or deletion breaks the chain from that point forward, which
-- GET /api/v1/organisations/:id/audit/verify can detect. Genesis row for
-- an organisation chains from the empty string.
--
-- Existing rows predate the chain and are left with NULL hash/prev_hash —
-- verification treats a NULL-hash row as outside the chain (neither valid
-- nor broken) rather than failing historical data it never signed.

ALTER TABLE audit_log ADD COLUMN prev_hash TEXT;
ALTER TABLE audit_log ADD COLUMN hash TEXT;
