/** Decision Intelligence client — hits Escalate MY API when configured */

export interface AssessResult {
  severity: 1 | 2 | 3 | 4
  confidence: number
  regulatory_risk: 'Low' | 'Medium' | 'High'
  first_actions: string[]
  rationale: string
  source: string
  disclaimer: string
}

const DEFAULT_API = 'https://escalate-my-api.khaliffhaned.workers.dev'

function base(): string {
  const fromEnv = ((import.meta as any).env?.VITE_API_BASE || '').replace(/\/$/, '')
  return fromEnv || DEFAULT_API
}

export function hasApiBase(): boolean {
  return Boolean(base())
}

export function apiBaseUrl(): string {
  return base()
}

export async function assessIncident(input: {
  facts: string
  bursaListed?: boolean
  mediaAttention?: boolean
  possibleMaterialInfo?: boolean
  regulatoryInvolved?: boolean
}): Promise<AssessResult> {
  const url = base()
  const res = await fetch(`${url}/api/v1/intelligence/assess`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    const t = await res.text()
    throw new Error(t || `Assess failed (${res.status})`)
  }
  const data = (await res.json()) as AssessResult
  return { ...data, source: data.source || 'api' }
}

export function assessIncidentLocal(facts: string, bursaListed = true): AssessResult {
  let severity: 1 | 2 | 3 | 4 = 1
  if (/media|news|viral/i.test(facts)) severity = 2
  if (/bursa|material|investor|share/i.test(facts) || (bursaListed && /recall|breach|accident/i.test(facts)))
    severity = 3
  if (/fatality|nationwide|regulator|sc |bnm/i.test(facts)) severity = 4
  const first_actions = [
    'Confirm facts and open Decision Log',
    'Set severity in Incident Management',
    severity >= 2 ? 'Activate core Crisis Team' : 'Monitor and update log',
    'Prepare holding statement (BM + EN) — do not release yet',
  ]
  if (bursaListed && severity >= 3) {
    first_actions.push('Company Secretary: assess Bursa LR disclosure obligation')
  }
  return {
    severity,
    confidence: 75,
    regulatory_risk: severity >= 3 ? 'High' : severity === 2 ? 'Medium' : 'Low',
    first_actions,
    rationale: `Local heuristic L${severity} (API offline).`,
    source: 'local',
    disclaimer: 'Operational recommendation only — not legal advice. Quorum before external action.',
  }
}
