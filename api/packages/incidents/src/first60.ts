export interface First60Step {
  step: number
  band: string
  en: string
  bm: string
  owner: string
}

export const FIRST_60_STEPS: First60Step[] = [
  { step: 1, band: '0–10 min', en: 'Facts confirmed and source verified', bm: 'Fakta disahkan dan sumber disemak', owner: 'Comms / Ops' },
  { step: 2, band: '0–10 min', en: 'Severity level assessed and recorded', bm: 'Tahap keterukan dinilai dan direkod', owner: 'Crisis Lead' },
  { step: 3, band: '0–10 min', en: 'Core Five notified by phone', bm: 'Core Five dimaklum melalui telefon', owner: 'Crisis Lead' },
  { step: 4, band: '10–20 min', en: 'Disclosure assessment initiated (Bursa LR)', bm: 'Penilaian pendedahan dimulakan (Bursa LR)', owner: 'Company Secretary' },
  { step: 5, band: '10–20 min', en: 'Media and social monitoring activated', bm: 'Pemantauan media dan sosial diaktifkan', owner: 'Comms / Digital' },
  { step: 6, band: '10–20 min', en: 'Decision log started', bm: 'Log keputusan dimulakan', owner: 'Crisis Lead' },
  { step: 7, band: '20–40 min', en: 'Holding statement drafted (EN + BM)', bm: 'Kenyataan awal digubal (EN + BM)', owner: 'Comms' },
  { step: 8, band: '20–40 min', en: 'Legal / CoSec clearance path opened', bm: 'Laluan kelulusan Legal / CoSec dibuka', owner: 'Legal / CoSec' },
  { step: 9, band: '20–40 min', en: 'Spokespeople aligned; others no-comment', bm: 'Juruucap diselaraskan; lain no-comment', owner: 'Comms' },
  { step: 10, band: '40–60 min', en: 'Board notification considered (L3+)', bm: 'Pemberitahuan Lembaga dipertimbang (T3+)', owner: 'CEO / Sec' },
  { step: 11, band: '40–60 min', en: 'Regulatory clocks started with named owners', bm: 'Jam pengawalseliaan dimulakan dengan pemilik', owner: 'Crisis Lead' },
  { step: 12, band: '40–60 min', en: 'External counsel engaged if required', bm: 'Peguam luar dilibatkan jika perlu', owner: 'Legal' },
  { step: 13, band: '40–60 min', en: 'Next update time committed and logged', bm: 'Masa kemas kini seterusnya ditetapkan dan dilog', owner: 'Crisis Lead' },
]

export function first60Checklist() {
  return FIRST_60_STEPS
}
