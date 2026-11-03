import type { BoardInsights, Incident, QuorumResponse } from '@escalate-my/shared'

export function buildBoardInsights(input: {
  incident: Incident
  quorum?: QuorumResponse[]
  openTaskCount?: number
  matchedObligationCount?: number
}): BoardInsights {
  const { incident } = input
  const top_risks: string[] = []
  const pending_decisions: string[] = []
  const regulatory_exposure: string[] = []
  const recommended_board_actions: string[] = []

  if (!incident.severity) top_risks.push('Severity not yet classified')
  if (incident.severity && incident.severity >= 3) {
    top_risks.push('Material or critical severity — board oversight expected')
    recommended_board_actions.push('Confirm Board notification path and timing')
  }
  if (incident.status === 'open') top_risks.push('Incident remains open')

  const pendingQuorum = (input.quorum || []).filter((q) => q.state === 'pending')
  if (pendingQuorum.length) {
    pending_decisions.push(
      `Quorum pending: ${pendingQuorum.map((q) => q.role).join(', ')}`
    )
  }
  if (!incident.statement) pending_decisions.push('Holding statement not yet drafted')
  if (input.openTaskCount && input.openTaskCount > 0) {
    pending_decisions.push(`${input.openTaskCount} open first-hour / response tasks`)
  }

  if (input.matchedObligationCount && input.matchedObligationCount > 0) {
    regulatory_exposure.push(
      `${input.matchedObligationCount} potential regulatory obligation(s) matched — counsel review required`
    )
  }
  if (incident.severity && incident.severity >= 3) {
    regulatory_exposure.push('Bursa disclosure assessment recommended for listed issuers')
  }

  recommended_board_actions.push('Review Decision Quorum before any external statement')
  recommended_board_actions.push('Confirm Regulatory Clock owners and deadlines')
  if (incident.severity && incident.severity >= 3) {
    recommended_board_actions.push('Schedule formal Board update (BoardBrief)')
  }

  // Simple readiness score
  let score = 40
  if (incident.severity) score += 15
  if (incident.statement) score += 10
  if (pendingQuorum.length === 0 && (input.quorum?.length || 0) > 0) score += 20
  else if ((input.quorum?.length || 0) > 0) score += 5
  if (!input.openTaskCount) score += 10
  score = Math.min(100, score)

  return {
    top_risks,
    pending_decisions,
    regulatory_exposure,
    recommended_board_actions,
    readiness_score: score,
    disclaimer:
      'Board Intelligence insights are operational aids only — not legal or disclosure advice.',
  }
}
