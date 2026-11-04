import type { MatchedObligation } from '@escalate-my/shared'

export interface ObligationRow {
  id: string
  regulator: string
  code: string
  title_en: string
  title_bm: string
  trigger_hints: string
  deadline_en: string
  deadline_bm: string
  status: string
  active: number
  deadline_hours?: number | null
}

export function matchObligations(
  facts: string,
  rows: ObligationRow[],
  opts?: { bursaListed?: boolean }
): MatchedObligation[] {
  const text = facts.toLowerCase()
  const scored: MatchedObligation[] = []

  for (const row of rows) {
    if (!row.active) continue
    const hints = row.trigger_hints.split(',').map((h) => h.trim().toLowerCase()).filter(Boolean)
    let hits = 0
    for (const h of hints) {
      if (h && text.includes(h)) hits++
    }
    // Bursa-listed boost for Bursa obligations
    if (opts?.bursaListed && row.regulator === 'Bursa Malaysia') hits += 1
    if (hits === 0) continue
    const match_score = Math.min(100, hits * 25)
    scored.push({
      id: row.id,
      regulator: row.regulator,
      code: row.code,
      title_en: row.title_en,
      title_bm: row.title_bm,
      deadline_en: row.deadline_en,
      status: row.status,
      match_score,
      review_required: true,
    })
  }

  return scored.sort((a, b) => b.match_score - a.match_score)
}
