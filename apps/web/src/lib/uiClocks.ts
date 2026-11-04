/**
 * Labels for the 7 clock ids that FullIncidentPayload.clocks is actually
 * keyed by (see api/apps/api/src/index.ts's /full route — it maps
 * incident_obligations back to UI clock ids via uiClockIdForObligation()).
 *
 * This is NOT the same id scheme as GET /api/v1/regulatory/clocks (the
 * obligation catalog) — those ids only overlap for 3 of 7 entries
 * (bursa-material, pdpa-individuals, nacsa-ncii). Content below is copied
 * from the real app's src/verifiedPractice.ts (VERIFIED_CLOCKS), the
 * authoritative source for these labels, so this screen says the same thing
 * the rest of the product does.
 */
export interface UiClockLabel {
  id: string
  regulator: string
  label: string
  deadline: string
}

export const UI_CLOCKS: UiClockLabel[] = [
  { id: 'bursa-material', regulator: 'Bursa Malaysia', label: 'Material information', deadline: 'Immediate public disclosure' },
  { id: 'bursa-uma', regulator: 'Bursa Malaysia', label: 'UMA / Exchange query', deadline: 'Immediate response' },
  { id: 'bursa-halt', regulator: 'Bursa Malaysia', label: 'Trading halt request', deadline: 'Same session' },
  { id: 'pdpc-breach', regulator: 'PDPA', label: 'Personal data breach notice', deadline: '72 hours from awareness' },
  { id: 'pdpa-individuals', regulator: 'PDPA', label: 'Notify affected individuals', deadline: 'Within 7 days of PDPC notice' },
  { id: 'nacsa-ncii', regulator: 'NACSA', label: 'Cyber incident (NCII)', deadline: '6 hours for particulars' },
  { id: 'dosh-fatal', regulator: 'DOSH', label: 'Death / serious injury', deadline: 'Immediate; JKKP 6 within 7 days' },
]

/** The 3 clocks shown on the Command Centre summary card — one per
 * regulator family, matching the product's own emphasis (Bursa, PDPA, DOSH
 * are the three regulators named across the rest of the app's copy). */
export const COMMAND_CENTRE_CLOCK_IDS = ['bursa-material', 'pdpc-breach', 'dosh-fatal']
