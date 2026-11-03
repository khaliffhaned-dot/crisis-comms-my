-- Regulatory Intelligence™ — obligation catalog
CREATE TABLE regulatory_obligations (
  id TEXT PRIMARY KEY,
  regulator TEXT NOT NULL,
  code TEXT NOT NULL,
  title_en TEXT NOT NULL,
  title_bm TEXT NOT NULL,
  trigger_hints TEXT NOT NULL DEFAULT '',
  deadline_en TEXT NOT NULL,
  deadline_bm TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'calibrate',
  source TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_reg_obl_regulator ON regulatory_obligations(regulator);

INSERT INTO regulatory_obligations (id, regulator, code, title_en, title_bm, trigger_hints, deadline_en, deadline_bm, status, source) VALUES
('obl_bursa_903', 'Bursa Malaysia', 'LR-9.03', 'Immediate disclosure of material information', 'Pendedahan serta-merta maklumat material', 'material,share price,investor,listed,bursa,announcement', 'Immediate via Bursa LINK', 'Serta-merta melalui Bursa LINK', 'verified', 'Bursa LR Chapter 9'),
('obl_bursa_911', 'Bursa Malaysia', 'LR-9.11', 'Response to unusual market activity / rumour', 'Respons aktiviti pasaran / khabar angin', 'rumour,speculation,market,share,trading', 'As soon as reasonably practicable', 'Sebaik praktikal', 'verified', 'Bursa LR 9.11'),
('obl_pdpa_72', 'PDPA', 'PDPA-12B', 'Notify PDP Commissioner of data breach', 'Maklum Pesuruhjaya PDP tentang pelanggaran data', 'data breach,personal data,pdpa,leak,cyber,privacy', '72 hours from awareness', '72 jam dari kesedaran', 'verified', 'PDPA s.12B + Guideline 2025'),
('obl_pdpa_ind', 'PDPA', 'PDPA-IND', 'Notify affected individuals', 'Maklum individu terjejas', 'data breach,personal data,customers,employees', 'Without undue delay / applicable window', 'Tanpa kelewatan wajar', 'practice', 'PDPA Guideline 2025'),
('obl_dosh_nado', 'DOSH', 'NADOPOD', 'Workplace incident notification', 'Pemberitahuan insiden tempat kerja', 'accident,fatality,injury,factory,workplace,dosh,jkkp', 'Immediate + written within 7 days where required', 'Serta-merta + bertulis dalam 7 hari jika berkenaan', 'verified', 'NADOPOD 2004'),
('obl_nacsa', 'NACSA', 'CSA-NCII', 'Critical / NCII incident notification', 'Pemberitahuan insiden kritikal / NCII', 'cyber,ransomware,ncii,critical infrastructure,nacsa', 'Immediate + follow-up under CSA', 'Serta-merta + susulan di bawah CSA', 'calibrate', 'Cyber Security Act — counsel'),
('obl_sc', 'SC Malaysia', 'SC-GEN', 'Capital market disclosure (if applicable)', 'Pendedahan pasaran modal (jika berkenaan)', 'securities,capital market,sc,investor', 'Per applicable SC / CMSA rules', 'Mengikut peraturan SC / CMSA', 'calibrate', 'Counsel verify'),
('obl_bnm', 'BNM', 'BNM-OPS', 'Operational incident (licensed FIs)', 'Insiden operasi (institusi berlesen)', 'bank,insurance,payment,bnm,financial', 'Per BNM operational resilience rules', 'Mengikut peraturan ketahanan operasi BNM', 'calibrate', 'Licensed entities only');
