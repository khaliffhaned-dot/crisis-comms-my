export type ClockStatus = 'verified' | 'practice' | 'calibrate'

export interface RegulatoryClock {
  id: string
  regulator: string
  en: string
  bm: string
  deadline: string
  status: ClockStatus
  source: string
}

/** Malaysia regulatory clocks — operational guidance, not legal advice. */
export const REGULATORY_CLOCKS: RegulatoryClock[] = [
  {
    id: 'bursa-material',
    regulator: 'Bursa Malaysia',
    en: 'Material announcement',
    bm: 'Pengumuman material',
    deadline: 'Immediate via Bursa LINK (LR 9.03 / 9.11)',
    status: 'verified',
    source: 'Bursa Listing Requirements Chapter 9',
  },
  {
    id: 'pdpa-72h',
    regulator: 'PDPA',
    en: 'Notify Personal Data Protection Commissioner',
    bm: 'Maklum Pesuruhjaya Perlindungan Data Peribadi',
    deadline: '72 hours from awareness (s.12B + Guideline 2025)',
    status: 'verified',
    source: 'PDPA s.12B; Data Breach Notification Guideline 2025',
  },
  {
    id: 'pdpa-individuals',
    regulator: 'PDPA',
    en: 'Notify affected individuals',
    bm: 'Maklum individu terjejas',
    deadline: 'Without undue delay / within applicable window',
    status: 'practice',
    source: 'PDPA Guideline 2025 — counsel calibrate',
  },
  {
    id: 'nacsa-ncii',
    regulator: 'NACSA',
    en: 'NCII / critical incident notification',
    bm: 'Pemberitahuan insiden NCII / kritikal',
    deadline: 'Immediate + follow-up under CSA / 2024 regs',
    status: 'calibrate',
    source: 'Cyber Security Act 2024 — verify with counsel',
  },
  {
    id: 'dosh-nadopod',
    regulator: 'DOSH',
    en: 'Workplace incident (NADOPOD)',
    bm: 'Insiden tempat kerja (NADOPOD)',
    deadline: 'Immediate + written report within 7 days where required',
    status: 'verified',
    source: 'NADOPOD 2004 / JKKP',
  },
  {
    id: 'sc-disclosure',
    regulator: 'SC Malaysia',
    en: 'Capital market disclosure (if applicable)',
    bm: 'Pendedahan pasaran modal (jika berkenaan)',
    deadline: 'Per applicable SC guidelines / CMSA',
    status: 'calibrate',
    source: 'Counsel verification required',
  },
  {
    id: 'bnm-incident',
    regulator: 'BNM',
    en: 'Financial institution incident (licensed entities)',
    bm: 'Insiden institusi kewangan (entiti berlesen)',
    deadline: 'Per BNM operational resilience / sector rules',
    status: 'calibrate',
    source: 'Licensed entities only — counsel',
  },
]

export function listRegulatoryClocks() {
  return REGULATORY_CLOCKS
}
