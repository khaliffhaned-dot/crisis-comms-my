/**
 * A small set of realistic example signals for the guided demo walkthrough
 * (src/DemoWalkthrough.tsx). These are the only fabricated content in the
 * whole flow — everything downstream of picking one (the assessment,
 * severity, stakeholders, regulators, 3R flags, the incident record
 * itself) is computed live by the real backend, not scripted.
 */
export interface DemoSignalSeed {
  id: string
  source: string
  en: string
  bm: string
  incidentType: string
  severityHint: string
}

export const DEMO_SIGNALS: DemoSignalSeed[] = [
  {
    id: 'fire-substation',
    source: 'Bernama',
    en: 'Fire at electrical substation disrupts power supply to several districts.',
    bm: 'Kebakaran di pencawang elektrik menggangu bekalan kuasa ke beberapa daerah.',
    incidentType: 'operational',
    severityHint: 'high',
  },
  {
    id: 'vendor-breach',
    source: 'The Star',
    en: 'Customer database allegedly exposed in third-party vendor breach.',
    bm: 'Pangkalan data pelanggan didakwa terdedah dalam pelanggaran vendor pihak ketiga.',
    incidentType: 'cyber',
    severityHint: 'high',
  },
  {
    id: 'social-spike',
    source: 'X / Twitter',
    en: 'Viral complaint thread about product safety gains traction online.',
    bm: 'Bebenang aduan tular mengenai keselamatan produk mendapat perhatian dalam talian.',
    incidentType: 'reputation',
    severityHint: 'medium',
  },
  {
    id: 'workplace-accident',
    source: 'NST',
    en: 'Worker injured in factory equipment malfunction.',
    bm: 'Pekerja cedera akibat kerosakan peralatan kilang.',
    incidentType: 'operational',
    severityHint: 'medium',
  },
]
