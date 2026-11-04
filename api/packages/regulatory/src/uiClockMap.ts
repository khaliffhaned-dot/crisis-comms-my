/**
 * The real frontend's ClocksModule (src/verifiedPractice.ts, VERIFIED_CLOCKS)
 * uses its own 7 clock ids — more granular than, and different from, the
 * catalog ids below. This maps one to the other so "start this clock" in the
 * UI can create a real, cron-tracked incident_obligations row instead of
 * just flipping a local boolean nobody on the backend ever sees.
 *
 * Left out of the catalog on purpose (no numeric deadline to compute from):
 * none currently — all 7 UI clocks now have a catalog counterpart.
 */
export const UI_CLOCK_TO_OBLIGATION: Record<string, string> = {
  'bursa-material': 'obl_bursa_903',
  'bursa-uma': 'obl_bursa_911',
  'bursa-halt': 'obl_bursa_halt',
  'pdpc-breach': 'obl_pdpa_72',
  'pdpa-individuals': 'obl_pdpa_ind',
  'nacsa-ncii': 'obl_nacsa',
  'dosh-fatal': 'obl_dosh_nado',
}

export function obligationIdForUiClock(clockId: string): string | null {
  return UI_CLOCK_TO_OBLIGATION[clockId] ?? null
}

const OBLIGATION_TO_UI_CLOCK: Record<string, string> = Object.fromEntries(
  Object.entries(UI_CLOCK_TO_OBLIGATION).map(([clockId, obligationId]) => [obligationId, clockId])
)

export function uiClockIdForObligation(obligationId: string): string | null {
  return OBLIGATION_TO_UI_CLOCK[obligationId] ?? null
}
