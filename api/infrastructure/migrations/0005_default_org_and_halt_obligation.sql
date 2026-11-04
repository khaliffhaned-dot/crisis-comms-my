-- Backend unification: the real frontend has no organisation concept and no
-- way to provision one, so seed a default org it can use out of the box.
--
-- Also: the actual UI's ClocksModule (src/verifiedPractice.ts) tracks a
-- "Bursa — trading halt" clock that has no row in the obligation catalog
-- (which only had material disclosure LR 9.03 and UMA-query LR 9.11). Add it
-- so toggling that clock in the UI can create a real tracked obligation.

INSERT INTO organisations (id, name, slug, edition)
VALUES ('org_default', 'Escalate MY', 'escalate-my', 'enterprise');

INSERT INTO regulatory_obligations (id, regulator, code, title_en, title_bm, trigger_hints, deadline_en, deadline_bm, status, source, deadline_hours) VALUES
('obl_bursa_halt', 'Bursa Malaysia', 'LR-9.07', 'Request or respond to a trading halt', 'Permohonan atau respons kepada penggantungan dagangan', 'halt,suspend,trading,bursa', 'Immediate', 'Serta-merta', 'verified', 'Bursa LR Chapter 9', 0);
