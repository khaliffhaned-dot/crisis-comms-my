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

const CLOCKS = [
  {
    id: 'bursa-material',
    en: 'Bursa material announcement',
    bm: 'Pengumuman material Bursa',
    deadline: 'Immediate via Bursa LINK (LR 9.03 / 9.11)',
    status: 'verified',
  },
  {
    id: 'pdpa-72h',
    en: 'PDPA data breach notification (Commissioner)',
    bm: 'Pemberitahuan pelanggaran data PDPA (Pesuruhjaya)',
    deadline: '72 hours from awareness (s.12B + Guideline 2025)',
    status: 'verified',
  },
  {
    id: 'pdpa-7d',
    en: 'PDPA notify affected individuals',
    bm: 'PDPA maklum individu terjejas',
    deadline: 'Without undue delay / within 7 days as applicable',
    status: 'practice',
  },
  {
    id: 'nacsa-ncii',
    en: 'NACSA / NCII incident',
    bm: 'Insiden NACSA / NCII',
    deadline: 'Immediate + follow-up windows under CSA / 2024 regs',
    status: 'calibrate',
  },
  {
    id: 'dosh-nadopod',
    en: 'DOSH workplace incident (NADOPOD)',
    bm: 'Insiden tempat kerja JKKP (NADOPOD)',
    deadline: 'Immediate + written report within 7 days where required',
    status: 'verified',
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

function createServer() {
  const server = new McpServer({
    name: 'escalate-my',
    version: '1.0.0',
  })

  server.tool(
    'list_severity_levels',
    'List Escalate MY L1–L4 severity levels with Bursa flags and recommended actions (EN).',
    {},
    async () => ({
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(SEVERITY, null, 2),
        },
      ],
    })
  )

  server.tool(
    'recommend_severity',
    'Recommend a severity level from brief incident facts (Malaysia listed-company context).',
    {
      facts: z.string().describe('Short description of the incident facts'),
      mediaAttention: z.boolean().optional().describe('Rising media or social attention'),
      possibleMaterialInfo: z.boolean().optional().describe('Possible material information for investors'),
      regulatoryInvolved: z.boolean().optional().describe('Regulator already engaged or likely'),
    },
    async ({ facts, mediaAttention, possibleMaterialInfo, regulatoryInvolved }) => {
      let level: 1 | 2 | 3 | 4 = 1
      if (possibleMaterialInfo || regulatoryInvolved) level = 3
      else if (mediaAttention) level = 2
      if (regulatoryInvolved && possibleMaterialInfo) level = 4

      const row = SEVERITY[level]
      const text = [
        `Recommended: L${level} — ${row.en}`,
        `BM: ${row.bm}`,
        `Bursa disclosure assessment: ${row.bursa ? 'YES — involve Company Secretary before external statement' : 'Not automatic'}`,
        `Action: ${row.action}`,
        `Facts considered: ${facts}`,
        '',
        'Operational guidance only — not legal advice. Counsel must verify.',
      ].join('\n')

      return { content: [{ type: 'text' as const, text }] }
    }
  )

  server.tool(
    'list_regulatory_clocks',
    'List verified Malaysian regulatory clocks (Bursa, PDPA, NACSA, DOSH) used in Escalate MY.',
    {},
    async () => ({
      content: [{ type: 'text' as const, text: JSON.stringify(CLOCKS, null, 2) }],
    })
  )

  server.tool(
    'first_60_checklist',
    'Return the Escalate MY first-60-minutes checklist (13 steps with owners and time bands).',
    {},
    async () => ({
      content: [{ type: 'text' as const, text: JSON.stringify(FIRST_60, null, 2) }],
    })
  )

  server.tool(
    'draft_holding_outline',
    'Outline a holding statement structure (EN + BM prompts) for a scenario. Does not invent facts.',
    {
      scenario: z
        .enum(['operational', 'market', 'community', 'internal', 'cyber', 'governance'])
        .describe('Scenario type'),
      companyName: z.string().default('Company Name'),
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

      const o = outlines[scenario]
      const parts: string[] = [
        `Scenario: ${scenario}`,
        `Clearance path: Draft → Legal → Board (if L3+) → Final`,
        `Do not release until cleared. Same facts in EN and BM.`,
        '',
      ]
      if (lang === 'en' || lang === 'both') parts.push('EN:', o.en, '')
      if (lang === 'bm' || lang === 'both') parts.push('BM:', o.bm, '')
      parts.push('Operational template only — not legal advice.')

      return { content: [{ type: 'text' as const, text: parts.join('\n') }] }
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
          ].join('\n'),
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
