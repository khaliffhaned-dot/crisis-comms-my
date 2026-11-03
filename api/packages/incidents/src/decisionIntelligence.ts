import {
  recommendSeverity,
  SEVERITY,
  type IntelligenceAssessInput,
  type IntelligenceAssessResult,
  type Severity,
} from '@escalate-my/shared'

const DISCLAIMER =
  'Operational recommendation only — not legal advice. Human clearance (Decision Quorum) required before external action.'

/**
 * Decision Intelligence™ — rules baseline.
 * Swap/extend with Workers AI when AI binding is configured.
 */
export function assessIncidentRules(input: IntelligenceAssessInput): IntelligenceAssessResult {
  const severity = recommendSeverity({
    facts: input.facts,
    mediaAttention: input.mediaAttention,
    possibleMaterialInfo: input.possibleMaterialInfo || /bursa|material|share price|investor/i.test(input.facts),
    regulatoryInvolved: input.regulatoryInvolved,
  }) as Severity

  let confidence = 70
  if (input.bursaListed) confidence += 5
  if (input.mediaAttention) confidence += 5
  if (input.possibleMaterialInfo) confidence += 8
  if (input.regulatoryInvolved) confidence += 7
  confidence = Math.min(95, confidence)

  let regulatory_risk: IntelligenceAssessResult['regulatory_risk'] = 'Low'
  if (severity >= 3 || input.possibleMaterialInfo) regulatory_risk = 'High'
  else if (severity === 2 || input.mediaAttention || input.bursaListed) regulatory_risk = 'Medium'

  const first_actions: string[] = []
  first_actions.push('Confirm facts and open Decision Log')
  first_actions.push('Set severity in Incident Management')
  if (severity >= 2) first_actions.push('Activate core Crisis Team')
  if (severity >= 2) first_actions.push('Prepare holding statement (BM + EN) — do not release yet')
  if (input.bursaListed && (severity >= 3 || input.possibleMaterialInfo)) {
    first_actions.push('Company Secretary: assess Bursa LR disclosure obligation')
  }
  if (/data|pdpa|personal|breach|cyber/i.test(input.facts)) {
    first_actions.push('Legal: PDPA breach assessment (72h clock if confirmed)')
  }
  if (/accident|injury|fatality|factory|workplace/i.test(input.facts)) {
    first_actions.push('Operations/HSE: DOSH/NADOPOD notification path')
  }
  if (severity >= 3) first_actions.push('Notify Board channel via Company Secretary')
  first_actions.push('Start relevant Regulatory Clocks with named owners')

  const profile = SEVERITY[severity]
  const rationale = `${profile.en}. Regulatory risk: ${regulatory_risk}. Based on structured heuristics over provided facts.`

  return {
    severity,
    confidence,
    regulatory_risk,
    first_actions: first_actions.slice(0, 8),
    rationale,
    source: 'rules',
    disclaimer: DISCLAIMER,
  }
}
