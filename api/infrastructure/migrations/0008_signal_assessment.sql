-- Enriches signals with the same structured assessment Incident Assessment
-- already shows a human for a severity recommendation: who's likely
-- affected, which regulators may apply, and a 3R (Royal/Race/Religion)
-- sensitivity flag — all computed deterministically at signal-creation
-- time (see packages/incidents/src/signals.ts), not fabricated per-view.
-- Nullable: existing signals from before this migration simply show
-- nothing for these fields rather than a fake retrofitted assessment.
ALTER TABLE signals ADD COLUMN potential_stakeholders TEXT; -- JSON string[]
ALTER TABLE signals ADD COLUMN potential_authorities TEXT; -- JSON string[]
ALTER TABLE signals ADD COLUMN confidence INTEGER;
ALTER TABLE signals ADD COLUMN three_r_royal TEXT;
ALTER TABLE signals ADD COLUMN three_r_race TEXT;
ALTER TABLE signals ADD COLUMN three_r_religion TEXT;

-- Energy Commission (Suruhanjaya Tenaga) was missing from the obligation
-- catalog entirely — any power/utility-infrastructure signal (e.g. a
-- substation fire) had no real regulator to match against. Trigger hints
-- follow the same free-text-contains pattern as every other row here.
INSERT INTO regulatory_obligations (id, regulator, code, title_en, title_bm, trigger_hints, deadline_en, deadline_bm, status, source) VALUES
('obl_st_incident', 'Energy Commission', 'ST-INC', 'Power supply disruption / electrical incident notification', 'Pemberitahuan gangguan bekalan kuasa / insiden elektrik', 'electrical,substation,power,grid,energy,outage,transformer,blackout', 'As soon as reasonably practicable', 'Sebaik praktikal', 'calibrate', 'Suruhanjaya Tenaga — counsel verify');
