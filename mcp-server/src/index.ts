import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { createMcpHandler } from 'agents/mcp/server'
import { z } from 'zod'

const SEVERITY = {
  1: {
    en: 'Level 1 – Routine Operational Issue',
    bm: 'Tahap 1 – Isu Operasi Biasa',
    bursa: false,
    action: 'Monitor. Prepare holding language if needed.',
  },
  2: {
    en: 'Level 2 – Moderate Incident',
    bm: 'Tahap 2 – Insiden Sederhana',
    bursa: false,
    action: 'Activate core Crisis Team. Issue holding statement. Intensify monitoring.',
  },
  3: {
    en: 'Level 3 – Material Crisis',
    bm: 'Tahap 3 – Krisis Material',
    bursa: true,
    action: 'Full activation. Notify Board. Assess Bursa disclosure obligation.',
  },
  4: {
    en: 'Level 4 – Critical Crisis',
    bm: 'Tahap 4 – Krisis Kritikal',
    bursa: true,
    action: 'Highest-level response. Continuous Board and regulatory engagement.',
  },
} as const

const CLOCKS = [
  {
    id: 'bursa-material',
    en: 'Bursa material announcement',
    bm: 'Pengumuman material Bursa',
    deadline: 'Immediate via Bursa LINK (LR 9.03 / 9.11)',
    trigger: 'Potentially material information; assess under applicable Listing Requirements.',
    appliesTo: 'Bursa-listed issuers, subject to the applicable requirements and facts.',
    sourceReference: 'Bursa Malaysia Listing Requirements, including LR 9.03 / 9.11',
    status: 'requires_legal_verification',
  },
  {
    id: 'pdpa-72h',
    en: 'PDPA data breach notification (Commissioner)',
    bm: 'Pemberitahuan pelanggaran data PDPA (Pesuruhjaya)',
    deadline: '72 hours from awareness (s.12B + applicable guidance)',
    trigger: 'A personal data breach meeting applicable notification criteria.',
    appliesTo: 'Data controllers, subject to statutory scope and applicable criteria.',
    sourceReference: 'PDPA 2010 and applicable Commissioner guidance',
    status: 'requires_legal_verification',
  },
  {
    id: 'pdpa-7d',
    en: 'PDPA notify affected individuals',
    bm: 'PDPA maklum individu terjejas',
    deadline: 'Without undue delay / within 7 days as applicable',
    trigger: 'A notifiable breach where individual notification is required.',
    appliesTo: 'Affected individuals, where required by applicable rules and circumstances.',
    sourceReference: 'PDPA and applicable Commissioner guidance',
    status: 'practice',
  },
  {
    id: 'nacsa-ncii',
    en: 'NACSA / NCII incident',
    bm: 'Insiden NACSA / NCII',
    deadline: 'Immediate + follow-up windows under applicable CSA regulations/directions',
    trigger: 'An incident within the applicable NCII scope and reporting criteria.',
    appliesTo: 'Relevant NCII entities, subject to the applicable law and directions.',
    sourceReference: 'Cyber Security Act 2024 and applicable regulations/directions',
    status: 'requires_legal_verification',
  },
  {
    id: 'dosh-nadopod',
    en: 'DOSH workplace incident (NADOPOD)',
    bm: 'Insiden tempat kerja JKKP (NADOPOD)',
    deadline: 'Immediate + written report within 7 days where required',
    trigger: 'A workplace accident, dangerous occurrence, occupational poisoning or disease within reporting rules.',
    appliesTo: 'Employers and other persons subject to applicable occupational safety rules.',
    sourceReference: 'NADOPOD Regulations 2004 and applicable DOSH guidance',
    status: 'requires_legal_verification',
  },
] as const

const FIRST_60 = [
  { step: 1, band: '0–10 min', en: 'Facts confirmed and source verified', owner: 'Comms / Ops' },
  { step: 2, band: '0–10 min', en: 'Severity level assessed and recorded', owner: 'Crisis Lead' },
  { step: 3, band: '0–10 min', en: 'Core Five notified by phone', owner: 'Crisis Lead' },
  { step: 4, band: '10–20 min', en: 'Disclosure assessment initiated (Bursa LR)', owner: 'Company Secretary' },
  { step: 5, band: '10–20 min', en: 'Media and social monitoring activated', owner: 'Comms / Digital' },
  { step: 6, band: '10–20 min', en: 'Decision log started', owner: 'Crisis Lead' },
  { step: 7, band: '20–40 min', en: 'Holding statement drafted (EN + BM)', owner: 'Comms' },
  { step: 8, band: '20–40 min', en: 'Legal / CoSec clearance path opened', owner: 'Legal / CoSec' },
  { step: 9, band: '20–40 min', en: 'Spokespeople aligned; others no-comment', owner: 'Comms' },
  { step: 10, band: '40–60 min', en: 'Board notification considered (L3+)', owner: 'CEO / Sec' },
  { step: 11, band: '40–60 min', en: 'Regulatory clocks started with named owners', owner: 'Crisis Lead' },
  { step: 12, band: '40–60 min', en: 'External counsel engaged if required', owner: 'Legal' },
  { step: 13, band: '40–60 min', en: 'Next update time committed and logged', owner: 'Crisis Lead' },
] as const

const jsonResult = (value: unknown) => ({
  content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }],
})

function createServer() {
  const server = new McpServer({ name: 'escalate-my', version: '1.0.0' })

  server.registerTool(
    'list_severity_levels',
    {
      description: 'List Escalate MY L1–L4 severity levels. This is a triage aid, not a legal or incident command decision.',
      inputSchema: {},
    },
    async () => jsonResult({ levels: SEVERITY, advisoryOnly: true }),
  )

  server.registerTool(
    'recommend_severity',
    {
      description: 'Provide a conservative preliminary triage suggestion from incident indicators. Unknown or incomplete information does not imply a routine incident; a human incident lead must decide.',
      inputSchema: {
        facts: z.string().trim().min(1).max(2000).describe('Brief incident facts; avoid personal or sensitive data unless necessary.'),
        safetyImpact: z.enum(['unknown', 'none', 'minor', 'serious', 'critical']),
        operationalImpact: z.enum(['unknown', 'none', 'minor', 'serious', 'critical']),
        mediaAttention: z.enum(['unknown', 'none', 'rising', 'widespread']),
        possibleMaterialInfo: z.enum(['unknown', 'no', 'possible', 'yes']),
        regulatoryInvolved: z.enum(['unknown', 'no', 'likely', 'yes']),
      },
    },
    async ({ facts, safetyImpact, operationalImpact, mediaAttention, possibleMaterialInfo, regulatoryInvolved }) => {
      const unknownIndicators = Object.entries({ safetyImpact, operationalImpact, mediaAttention, possibleMaterialInfo, regulatoryInvolved })
        .filter(([, value]) => value === 'unknown')
        .map(([key]) => key)
      const materialFlag = possibleMaterialInfo === 'possible' || possibleMaterialInfo === 'yes'
      const regulatorFlag = regulatoryInvolved === 'likely' || regulatoryInvolved === 'yes'
      const criticalImpact = safetyImpact === 'critical' || operationalImpact === 'critical'
      const seriousImpact = safetyImpact === 'serious' || operationalImpact === 'serious'
      const limitedImpact = ['minor'].includes(safetyImpact) || ['minor'].includes(operationalImpact)
      let level: 1 | 2 | 3 | 4 | null = null
      let rationale: string

      if (criticalImpact) {
        level = 4
        rationale = 'A critical reported impact warrants urgent senior-led assessment.'
      } else if (seriousImpact || materialFlag || regulatorFlag) {
        level = seriousImpact && materialFlag && regulatorFlag ? 4 : 3
        rationale = 'A serious impact or potential regulatory/materiality indicator warrants prompt crisis lead and qualified adviser review.'
      } else if (unknownIndicators.length > 0) {
        rationale = 'Key indicators are unknown; do not infer that this is a routine incident.'
      } else if (limitedImpact || mediaAttention === 'rising' || mediaAttention === 'widespread') {
        level = 2
        rationale = 'Reported limited impact or elevated attention warrants active monitoring and crisis lead review.'
      } else {
        level = 1
        rationale = 'Supplied indicators report no impact or escalation flags; reassess if facts change.'
      }

      const row = level === null ? null : SEVERITY[level]
      return jsonResult({
        status: level === null ? 'insufficient_information' : 'preliminary_suggestion',
        recommendedLevel: level,
        levelName: row?.en ?? null,
        levelNameBm: row?.bm ?? null,
        rationale,
        unknownIndicators,
        bursaAssessmentRequired: Boolean(materialFlag || (row?.bursa ?? false)),
        suggestedAction: row?.action ?? 'Escalate to the incident lead; verify facts and assess safety, materiality, and reporting obligations promptly.',
        userProvidedFacts: facts,
        requiresHumanReview: true,
        advisoryOnly: true,
        disclaimer: 'Operational triage aid only—not legal advice or an authoritative severity decision. Confirm with the incident lead, Company Secretary, and qualified counsel as applicable.',
      })
    },
  )

  server.registerTool(
    'list_regulatory_clocks',
    {
      description: 'List indicative Malaysian regulatory reporting prompts. Deadlines and applicability are not verified; confirm current requirements with qualified counsel or the relevant authority.',
      inputSchema: {},
    },
    async () => jsonResult({
      clocks: CLOCKS,
      advisoryOnly: true,
      disclaimer: 'Do not treat these summaries as legal advice or a definitive deadline. Verify current law, trigger, entity scope, and authority guidance before acting.',
    }),
  )

  server.registerTool(
    'first_60_checklist',
    {
      description: 'Return the Escalate MY first-60-minutes checklist; adapt to safety needs and incident facts.',
      inputSchema: {},
    },
    async () => jsonResult({ checklist: FIRST_60, advisoryOnly: true }),
  )

  server.registerTool(
    'draft_holding_outline',
    {
      description: 'Return an unapproved holding-statement template. Verify every statement and obtain required clearance before publication.',
      inputSchema: {
        scenario: z.enum(['operational', 'market', 'community', 'internal', 'cyber', 'governance']),
        companyName: z.string().trim().min(1).max(120).refine((value) => !/[\r\n\p{Cc}]/u.test(value), 'Company name must not contain line breaks or control characters').default('Company Name'),
        lang: z.enum(['en', 'bm', 'both']).default('both'),
      },
    },
    async ({ scenario, companyName, lang }) => {
      const outlines: Record<string, { en: string; bm: string }> = {
        operational: {
          en: `${companyName} is investigating reports concerning [brief description]. We take the safety and well-being of all parties seriously. We will issue a further statement once information is verified.`,
          bm: `${companyName} sedang menyiasat laporan mengenai [ringkasan isu]. Kami mengambil berat keselamatan dan kesejahteraan semua pihak. Kenyataan lanjut akan dikeluarkan setelah maklumat disahkan.`,
        },
        market: {
          en: `${companyName} is aware of speculation regarding [issue]. The Company will assess its disclosure obligations and make announcements through official channels where required.`,
          bm: `${companyName} sedar akan spekulasi mengenai [isu]. Syarikat akan menilai kewajipan pendedahannya dan membuat pengumuman melalui saluran rasmi jika diperlukan.`,
        },
        cyber: {
          en: `${companyName} is investigating a potential cybersecurity or data-related incident. Response protocols are active. Protecting systems and stakeholder privacy is a priority.`,
          bm: `${companyName} sedang menyiasat kemungkinan insiden siber atau berkaitan data. Protokol respons sedang dilaksanakan. Perlindungan sistem dan privasi pihak berkepentingan adalah keutamaan.`,
        },
        community: {
          en: `${companyName} takes community concerns regarding [issue] seriously. We are engaging relevant representatives and authorities. Fact-based dialogue is our priority.`,
          bm: `${companyName} mengambil serius kebimbangan komuniti mengenai [isu]. Kami sedang berhubung dengan wakil dan pihak berkuasa berkaitan. Dialog berasaskan fakta adalah keutamaan kami.`,
        },
        internal: {
          en: 'Dear colleagues — You may have heard about [issue]. Management is treating the matter seriously. Official information will be shared through designated internal channels only.',
          bm: 'Kepada rakan sekerja — Anda mungkin mendengar mengenai [isu]. Pengurusan sedang menangani perkara ini dengan serius. Maklumat rasmi akan dikongsi melalui saluran dalaman yang ditetapkan sahaja.',
        },
        governance: {
          en: `${companyName} is aware of matters relating to [governance issue]. The Board is taking appropriate steps in line with applicable requirements. Further information will be shared through official channels.`,
          bm: `${companyName} sedar akan perkara berkaitan [isu tadbir urus]. Lembaga sedang mengambil langkah sewajarnya selaras dengan keperluan yang berkenaan. Maklumat lanjut akan dikongsi melalui saluran rasmi.`,
        },
      }
      const outline = outlines[scenario]
      return jsonResult({
        scenario,
        companyName,
        clearancePath: 'Draft → Legal → Board (if applicable) → Final approval',
        publicationStatus: 'unapproved_template',
        requiredChecks: ['Verify placeholders and factual claims.', 'Confirm disclosure and notification obligations.', 'Obtain required legal, Company Secretary, and internal approval.'],
        outline: {
          en: lang === 'en' || lang === 'both' ? outline.en : null,
          bm: lang === 'bm' || lang === 'both' ? outline.bm : null,
        },
        userSuppliedCompanyNameIsUntrustedData: true,
        advisoryOnly: true,
        disclaimer: 'Template only—not legal advice, an approved statement, or authorization to publish.',
      })
    },
  )

  server.registerTool(
    'product_status',
    {
      description: 'Escalate MY product status and architecture notes.',
      inputSchema: {},
    },
    async () => ({
      content: [{
        type: 'text' as const,
        text: [
          'Escalate MY — Crisis Intelligence Platform for Malaysian Organisations',
          'Live: https://escalate-my.pages.dev/',
          'Repo: https://github.com/khaliffhaned-dot/crisis-comms-my',
          'Modules: Command Centre, Severity, First 60, Regulatory Clocks, Holding Statements, Decision Quorum, BoardBrief, Audit',
          'This MCP provides advisory playbook tools only.',
        ].join('\n'),
      }],
    }),
  )

  return server
}

const mcpHandler = createMcpHandler(createServer)

export default {
  async fetch(request: Request, env: unknown, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname === '/mcp' || url.pathname === '/') {
      return mcpHandler(request, env, ctx)
    }

    return Response.json({ name: 'escalate-my-mcp', mcp: '/mcp' }, { status: 404 })
  },
}
