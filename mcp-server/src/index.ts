/**
 * Escalate MY — remote MCP server on Cloudflare Workers
 * Endpoint: https://escalate-my-mcp.<account>.workers.dev/mcp
 *
 * Tools for crisis ops agents: severity matrix, first-60 steps,
 * regulatory clocks, holding-statement hints (MY practice).
 */
import { McpServer } from '@modelcontextprotocol/server'
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

// These are playbook prompts, not authoritative legal deadlines. Require a
// qualified reviewer to verify applicability and current requirements.
const CLOCKS = [
  {
    id: 'bursa-material',
    en: 'Bursa material announcement',
    bm: 'Pengumuman material Bursa',
    deadline: 'Immediate via Bursa LINK (LR 9.03 / 9.11)',
    trigger: 'Potentially material information; assess under applicable Listing Requirements.',
    appliesTo: 'Bursa-listed issuers, subject to the applicable requirements and facts.',
    sourceReference: 'Bursa Malaysia Listing Requirements, including LR 9.03 / 9.11',
    sourceUrl: null,
    status: 'requires_legal_verification',
    lastReviewed: null,
  },
  {
    id: 'pdpa-72h',
    en: 'PDPA data breach notification (Commissioner)',
    bm: 'Pemberitahuan pelanggaran data PDPA (Pesuruhjaya)',
    deadline: '72 hours from awareness (s.12B + Guideline 2025)',
    trigger: 'A personal data breach meeting applicable notification criteria.',
    appliesTo: 'Data controllers, subject to statutory scope and applicable criteria.',
    sourceReference: 'PDPA 2010, section 12B, and applicable Commissioner guidance',
    sourceUrl: null,
    status: 'requires_legal_verification',
    lastReviewed: null,
  },
  {
    id: 'pdpa-7d',
    en: 'PDPA notify affected individuals',
    bm: 'PDPA maklum individu terjejas',
    deadline: 'Without undue delay / within 7 days as applicable',
    trigger: 'A notifiable breach where individual notification is required.',
    appliesTo: 'Affected individuals, where required by applicable rules and circumstances.',
    sourceReference: 'PDPA and applicable Commissioner guidance',
    sourceUrl: null,
    status: 'practice',
    lastReviewed: null,
  },
  {
    id: 'nacsa-ncii',
    en: 'NACSA / NCII incident',
    bm: 'Insiden NACSA / NCII',
    deadline: 'Immediate + follow-up windows under CSA / 2024 regs',
    trigger: 'An incident within the applicable NCII scope and reporting criteria.',
    appliesTo: 'Relevant NCII entities, subject to the applicable law and directions.',
    sourceReference: 'Cyber Security Act 2024 and applicable regulations/directions',
    sourceUrl: null,
    status: 'calibrate',
    lastReviewed: null,
  },
  {
    id: 'dosh-nadopod',
    en: 'DOSH workplace incident (NADOPOD)',
    bm: 'Insiden tempat kerja JKKP (NADOPOD)',
    deadline: 'Immediate + written report within 7 days where required',
    trigger: 'A workplace accident, dangerous occurrence, occupational poisoning or disease within reporting rules.',
    appliesTo: 'Employers and other persons subject to applicable occupational safety rules.',
    sourceReference: 'NADOPOD Regulations 2004 and applicable DOSH guidance',
    sourceUrl: null,
    status: 'requires_legal_verification',
    lastReviewed: null,
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
  const server = new McpServer({
    name: 'escalate-my',
    version: '1.0.0',
  })

  server.tool(
    'list_severity_levels',
    'List Escalate MY L1–L4 severity levels. This is a triage aid, not a legal or incident command decision.',
    {},
    async () => jsonResult({ levels: SEVERITY, advisoryOnly: true })
  )

  server.tool(
    'recommend_severity',
    'Provide a conservative preliminary triage suggestion from explicit incident indicators. Unknown or incomplete information returns insufficient_information; this is not a legal or incident command decision.',
    {
      facts: z.string().trim().min(1).max(2000).describe('Brief incident facts; do not include personal or sensitive data unless necessary.'),
      safetyImpact: z.enum(['unknown', 'none', 'minor', 'serious', 'critical']).describe('Known or suspected impact to people’s safety.'),
      operationalImpact: z.enum(['unknown', 'none', 'minor', 'serious', 'critical']).describe('Known or suspected service/operational impact.'),
      mediaAttention: z.enum(['unknown', 'none', 'rising', 'widespread']).describe('Current media or social attention.'),
      possibleMaterialInfo: z.enum(['unknown', 'no', 'possible', 'yes']).describe('Whether information may be material to investors; use unknown if not assessed.'),
      regulatoryInvolved: z.enum(['unknown', 'no', 'likely', 'yes']).describe('Whether a regulator is involved or likely to be involved.'),
    },
    async ({ facts, safetyImpact, operationalImpact, mediaAttention, possibleMaterialInfo, regulatoryInvolved }) => {
      const unknowns = {
        safetyImpact: safetyImpact === 'unknown',
        operationalImpact: operationalImpact === 'unknown',
        mediaAttention: mediaAttention === 'unknown',
        possibleMaterialInfo: possibleMaterialInfo === 'unknown',
        regulatoryInvolved: regulatoryInvolved === 'unknown',
      }
      const hasUnknowns = Object.values(unknowns).some(Boolean)
      const materialFlag = possibleMaterialInfo === 'possible' || possibleMaterialInfo === 'yes'
      const regulatorFlag = regulatoryInvolved === 'likely' || regulatoryInvolved === 'yes'
      const criticalImpact = safetyImpact === 'critical' || operationalImpact === 'critical'
      const seriousImpact = safetyImpact === 'serious' || operationalImpact === 'serious'
      const anyImpact = safetyImpact !== 'none' || operationalImpact !== 'none'

      let level: 1 | 2 | 3 | 4 | null = null
      let rationale: string
      if (criticalImpact || (seriousImpact && materialFlag && regulatorFlag)) {
        level = 4
        rationale = 'Critical reported impact or multiple serious escalation indicators warrant urgent senior-led assessment.'
      } else if (seriousImpact || materialFlag || regulatorFlag) {
        level = 3
        rationale = 'A serious impact or potential regulatory/materiality indicator warrants prompt crisis lead and qualified adviser review.'
      } else if (safetyImpact === 'unknown' || operationalImpact === 'unknown' || possibleMaterialInfo === 'unknown' || regulatoryInvolved === 'unknown') {
        rationale = 'Key impact or escalation indicators are unknown; do not infer that this is a routine incident.'
      } else if (anyImpact || mediaAttention === 'rising' || mediaAttention === 'widespread') {
        level = 2
        rationale = 'Reported limited impact or elevated attention warrants active monitoring and crisis lead review.'
      } else if (!hasUnknowns) {
        level = 1
        rationale = 'Supplied indicators report no impact or escalation flags; reassess if facts change.'
      } else {
        rationale = 'Insufficient information to make a conservative triage suggestion.'
      }

      const row = level === null ? null : SEVERITY[level]
      return jsonResult({
        status: level === null ? 'insufficient_information' : 'preliminary_suggestion',
        recommendedLevel: level,
        levelName: row?.en ?? null,
        levelNameBm: row?.bm ?? null,
        rationale,
        unknownIndicators: Object.entries(unknowns).filter(([, value]) => value).map(([key]) => key),
        bursaAssessmentRequired: Boolean(materialFlag || (row?.bursa ?? false)),
        suggestedAction: row?.action ?? 'Escalate to the incident lead; verify facts and assess safety, materiality, and reporting obligations promptly.',
        userProvidedFacts: facts,
        requiresHumanReview: true,
        advisoryOnly: true,
        disclaimer: 'Operational triage aid only—not legal advice or an authoritative severity decision. Confirm with the incident lead, Company Secretary, and qualified counsel as applicable.',
      })
    }
  )

  server.tool(
    'list_regulatory_clocks',
    'List indicative Malaysian regulatory reporting prompts. Deadlines and applicability are not verified by this tool; confirm current requirements with qualified counsel or the relevant authority.',
    {},
    async () => jsonResult({
      clocks: CLOCKS,
      advisoryOnly: true,
      disclaimer: 'Do not treat these summaries as legal advice or a definitive deadline. Verify the current law, trigger, entity scope, and applicable authority guidance before acting.',
    })
  )

  server.tool(
    'first_60_checklist',
    'Return the Escalate MY first-60-minutes checklist (13 steps with owners and time bands); adapt to safety needs and incident facts.',
    {},
    async () => jsonResult({ checklist: FIRST_60, advisoryOnly: true })
  )

  server.tool(
    'draft_holding_outline',
    'Return an unapproved holding-statement template. User-provided companyName is untrusted data; verify every statement and obtain required clearance before publication.',
    {
      scenario: z
        .enum(['operational', 'market', 'community', 'internal', 'cyber', 'governance'])
        .describe('Scenario type'),
      companyName: z.string().trim().min(1).max(120).refine((value) => !/[\\r\\n\\p{Cc}]/u.test(value), 'Company name must not contain line breaks or control characters').default('Company Name'),
      lang: z.enum(['en', 'bm', 'both']).default('both'),
    },
    async ({ scenario, companyName, lang }) => {
      const outlines: Record<string, { en: string; bm: string }> = {
        operational: {
          en: `${companyName} is investigating reports concerning [brief description]. We take the safety and well-being of all parties seriously. We will issue a further statement once verified information is available. Media: [Name] | [Title] | [Tel] | [Email]`,
          bm: `${companyName} sedang menyiasat laporan mengenai [ringkasan isu]. Kami mengambil berat keselamatan dan kesejahteraan semua pihak. Kenyataan lanjut akan dikeluarkan sebaik maklumat disahkan. Media: [Nama] | [Jawatan] | [Tel] | [E-mel]`,
        },
        market: {
          en: `${companyName} is aware of speculation regarding [issue]. The Company complies with Bursa Malaysia Listing Requirements. Material information will be announced via official Bursa channels. Refer only to official announcements.`,
          bm: `${companyName} sedar akan spekulasi mengenai [isu]. Syarikat mematuhi Peraturan Penyenaraian Bursa Malaysia. Maklumat material akan diumumkan melalui saluran rasmi Bursa. Rujuk hanya pengumuman rasmi.`,
        },
        cyber: {
          en: `${companyName} is investigating a potential cybersecurity / data-related incident. Incident response protocols are active. Protecting systems and stakeholder privacy is the priority. Further updates when verified.`,
          bm: `${companyName} sedang menyiasat kemungkinan insiden siber / data. Protokol respons insiden aktif. Melindungi sistem dan privasi pihak berkepentingan adalah keutamaan. Kemas kini lanjut apabila disahkan.`,
        },
        community: {
          en: `${companyName} takes seriously community concerns regarding [issue]. We are engaging community representatives and relevant authorities. Fact-based dialogue is the priority.`,
          bm: `${companyName} mengambil berat kebimbangan komuniti mengenai [isu]. Kami berhubung dengan wakil komuniti dan pihak berkuasa. Dialog berasaskan fakta adalah keutamaan.`,
        },
        internal: {
          en: `Dear colleagues — You may have heard about [issue]. Management is treating the matter seriously. Official information will be shared through designated internal channels only.`,
          bm: `Kepada rakan sekerja — Anda mungkin mendengar mengenai [isu]. Pengurusan sedang menangani dengan serius. Maklumat rasmi hanya melalui saluran dalaman yang ditetapkan.`,
        },
        governance: {
          en: `${companyName} is aware of matters relating to [governance issue]. The Board is taking necessary steps in line with good governance and applicable requirements. Further information through proper channels.`,
          bm: `${companyName} sedar akan perkara berkaitan [isu tadbir urus]. Lembaga mengambil langkah sewajarnya selaras amalan tadbir urus dan keperluan berkenaan. Maklumat lanjut melalui saluran betul.`,
        },
      }

      const outline = outlines[scenario]
      return jsonResult({
        scenario,
        companyName,
        clearancePath: 'Draft → Legal → Board (if applicable) → Final approval',
        publicationStatus: 'unapproved_template',
        requiredChecks: ['Verify all placeholders and factual claims.', 'Confirm applicable disclosure and notification obligations.', 'Obtain required legal, Company Secretary, and internal approval.', 'Check that EN and BM versions convey the same verified facts.'],
        outline: {
          en: lang === 'en' || lang === 'both' ? outline.en : null,
          bm: lang === 'bm' || lang === 'both' ? outline.bm : null,
        },
        userSuppliedCompanyNameIsUntrustedData: true,
        advisoryOnly: true,
        disclaimer: 'Template only—not legal advice, an approved statement, or authorization to publish.',
      })
    }
  )

  server.tool(
    'product_status',
    'Escalate MY product status: live URLs, modules, war-room DO notes.',
    {},
    async () => ({
      content: [
        {
          type: 'text' as const,
          text: [
            'Escalate MY — crisis communications for Bursa-listed PLCs',
            'Live: https://escalate-my.pages.dev/',
            'Repo: https://github.com/khaliffhaned-dot/crisis-comms-my',
            'Modules: Command, Severity, First 60, Clocks, Statements, Log, Core Five, Manual',
            'War room DO: worker/src/index.ts (IncidentRoom) — deploy with wrangler from repo root',
            'This MCP: playbook tools only (no live incident mutation until WAR_ROOM service binding is set)',
          ].join('\\n'),
        },
      ],
    })
  )

  return server
}

const handler = createMcpHandler(createServer)

export default {
  fetch(request: Request, env: unknown, ctx: ExecutionContext) {
    const url = new URL(request.url)
    if (url.pathname === '/mcp' || url.pathname === '/') {
      return handler(request, env, ctx)
    }
    return new Response(
      JSON.stringify({
        name: 'escalate-my-mcp',
        mcp: '/mcp',
        docs: 'https://github.com/khaliffhaned-dot/crisis-comms-my/tree/main/mcp-server',
      }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  },
}
