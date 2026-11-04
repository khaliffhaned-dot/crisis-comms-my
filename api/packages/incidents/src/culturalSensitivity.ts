/**
 * 3R Assessment — Royal / Race / Religion sensitivity flagging, specific to
 * the Malaysian regulatory and media environment. This is a narrow keyword
 * heuristic, not a determination: it exists to surface "this may need
 * Legal/Corporate Affairs review before any public statement" to a human,
 * never to decide anything on its own. Same posture as severity
 * classification elsewhere in this product — deterministic, never AI,
 * always reviewable, always wrong sometimes.
 *
 * Deliberately conservative in what it matches: the Race list detects
 * tension/conflict *language* (riot, ethnic clash, racial) rather than
 * naming specific ethnic groups, so the heuristic itself doesn't encode
 * any profiling. A false negative here just means the normal human
 * incident-assessment process catches it instead, which is the same
 * safety net every other "Low" result in this product relies on.
 */
import type { ThreeRLevel, ThreeRAssessment } from '@escalate-my/shared'

const ROYAL_TERMS = /\b(agong|sultan|sultanah|raja|istana|diraja|royal household|menteri besar.*istana|monarchy)\b/i
const RACE_TERMS = /\b(race riot|ethnic (tension|clash|conflict)|racial(ly)?|racist|inter-?ethnic|perkauman|sentimen kaum)\b/i
const RELIGION_TERMS = /\b(blasphemy|interfaith|religious (tension|sensitivity|insult)|insult(s|ed|ing)? (islam|christianity|buddhism|hinduism)|mosque|surau|church|temple|hak ugama|sensitiviti agama)\b/i

function levelFor(text: string, pattern: RegExp): ThreeRLevel {
  return pattern.test(text) ? 'Medium' : 'Low'
}

/**
 * Only ever escalates on an explicit keyword hit — never infers High from
 * severity or any other signal. A human reviewing a "Medium" flag can
 * raise it to High; this heuristic never assigns High itself, since
 * distinguishing "mentions a mosque" from "genuinely inflammatory" needs
 * actual judgment this function doesn't have.
 */
export function assessThreeR(text: string): ThreeRAssessment {
  return {
    royal: levelFor(text, ROYAL_TERMS),
    race: levelFor(text, RACE_TERMS),
    religion: levelFor(text, RELIGION_TERMS),
  }
}

export function threeRRequiresElevatedReview(assessment: ThreeRAssessment): boolean {
  return assessment.royal !== 'Low' || assessment.race !== 'Low' || assessment.religion !== 'Low'
}
