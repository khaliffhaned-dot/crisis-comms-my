import type { Severity } from './types'

export interface IntelligenceAssessInput {
  facts: string
  industry?: string
  bursaListed?: boolean
  mediaAttention?: boolean
  possibleMaterialInfo?: boolean
  regulatoryInvolved?: boolean
  customersAffected?: number
}

export interface IntelligenceAssessResult {
  severity: Severity
  confidence: number
  regulatory_risk: 'Low' | 'Medium' | 'High'
  first_actions: string[]
  rationale: string
  source: 'rules' | 'workers-ai'
  disclaimer: string
}

export interface MatchedObligation {
  id: string
  regulator: string
  code: string
  title_en: string
  title_bm: string
  deadline_en: string
  status: string
  match_score: number
  review_required: boolean
}

export interface BoardInsights {
  top_risks: string[]
  pending_decisions: string[]
  regulatory_exposure: string[]
  recommended_board_actions: string[]
  readiness_score: number
  disclaimer: string
}
