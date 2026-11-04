export type HoldingScenario =
  | 'operational'
  | 'market'
  | 'community'
  | 'internal'
  | 'cyber'
  | 'governance'
  | 'product_recall'
  | 'data_breach'
  | 'industrial_accident'
  | 'executive_misconduct'
  | 'service_outage'

const TEMPLATES: Record<string, { en: string; bm: string }> = {
  operational: {
    en: '{{company}} is investigating reports concerning {{issue}}. We take the safety and well-being of all parties seriously. We will issue a further statement once verified information is available.',
    bm: '{{company}} sedang menyiasat laporan mengenai {{issue}}. Kami mengambil berat keselamatan dan kesejahteraan semua pihak. Kenyataan lanjut akan dikeluarkan sebaik maklumat disahkan.',
  },
  market: {
    en: '{{company}} is aware of speculation regarding {{issue}}. The Company complies with Bursa Malaysia Listing Requirements. Material information will be announced via official Bursa channels.',
    bm: '{{company}} sedar akan spekulasi mengenai {{issue}}. Syarikat mematuhi Peraturan Penyenaraian Bursa Malaysia. Maklumat material akan diumumkan melalui saluran rasmi Bursa.',
  },
  cyber: {
    en: '{{company}} is investigating a potential cybersecurity / data-related incident. Incident response protocols are active. Protecting systems and stakeholder privacy is the priority.',
    bm: '{{company}} sedang menyiasat kemungkinan insiden siber / data. Protokol respons insiden aktif. Melindungi sistem dan privasi pihak berkepentingan adalah keutamaan.',
  },
  data_breach: {
    en: '{{company}} is investigating a potential personal data incident. We are assessing scope under the PDPA and will notify the Commissioner and affected individuals as required.',
    bm: '{{company}} sedang menyiasat kemungkinan insiden data peribadi. Kami menilai skop di bawah PDPA dan akan memaklumkan Pesuruhjaya serta individu terjejas seperti dikehendaki.',
  },
  product_recall: {
    en: '{{company}} is initiating precautionary action regarding {{issue}}. Consumer safety is the priority. Further instructions will follow through official channels.',
    bm: '{{company}} memulakan tindakan berjaga-jaga mengenai {{issue}}. Keselamatan pengguna adalah keutamaan. Arahan lanjut melalui saluran rasmi.',
  },
  industrial_accident: {
    en: '{{company}} confirms an incident at {{issue}}. Emergency response is underway. We are cooperating with the relevant authorities. Further updates when verified.',
    bm: '{{company}} mengesahkan insiden di {{issue}}. Respons kecemasan sedang dijalankan. Kami bekerjasama dengan pihak berkuasa. Kemas kini lanjut apabila disahkan.',
  },
  executive_misconduct: {
    en: '{{company}} is aware of allegations relating to {{issue}}. The matter is being reviewed under our governance processes. Further information through proper channels.',
    bm: '{{company}} sedar akan dakwaan berkaitan {{issue}}. Perkara ini dikaji di bawah proses tadbir urus kami. Maklumat lanjut melalui saluran betul.',
  },
  service_outage: {
    en: '{{company}} is aware of a service disruption affecting {{issue}}. Teams are working to restore service. We apologise for the inconvenience.',
    bm: '{{company}} sedar akan gangguan perkhidmatan yang menjejaskan {{issue}}. Pasukan sedang memulihkan perkhidmatan. Kami memohon maaf atas kesulitan.',
  },
  community: {
    en: '{{company}} takes seriously community concerns regarding {{issue}}. We are engaging community representatives and relevant authorities.',
    bm: '{{company}} mengambil berat kebimbangan komuniti mengenai {{issue}}. Kami berhubung dengan wakil komuniti dan pihak berkuasa.',
  },
  internal: {
    en: 'Dear colleagues — You may have heard about {{issue}}. Management is treating the matter seriously. Official information will be shared through designated internal channels only.',
    bm: 'Kepada rakan sekerja — Anda mungkin mendengar mengenai {{issue}}. Pengurusan sedang menangani dengan serius. Maklumat rasmi hanya melalui saluran dalaman yang ditetapkan.',
  },
  governance: {
    en: '{{company}} is aware of matters relating to {{issue}}. The Board is taking necessary steps in line with good governance and applicable requirements.',
    bm: '{{company}} sedar akan perkara berkaitan {{issue}}. Lembaga mengambil langkah sewajarnya selaras amalan tadbir urus dan keperluan berkenaan.',
  },
}

export function createHoldingStatement(opts: {
  scenario: string
  company: string
  issue: string
  lang: 'en' | 'bm' | 'both'
}): { en?: string; bm?: string; disclaimer: string } {
  const tpl = TEMPLATES[opts.scenario] || TEMPLATES.operational
  const fill = (s: string) =>
    s.replace(/\{\{company\}\}/g, opts.company).replace(/\{\{issue\}\}/g, opts.issue)
  const disclaimer =
    'Operational template only — not legal advice. Clear via Decision Quorum before release.'
  if (opts.lang === 'en') return { en: fill(tpl.en), disclaimer }
  if (opts.lang === 'bm') return { bm: fill(tpl.bm), disclaimer }
  return { en: fill(tpl.en), bm: fill(tpl.bm), disclaimer }
}

export interface DraftHoldingStatementInput {
  scenario: string
  company: string
  issue: string
  lang: 'en' | 'bm' | 'both'
  /** Extra situational detail beyond the one-line `issue`, when available —
   * sharpens the AI draft. Optional; the template path never uses it. */
  facts?: string
}

export interface DraftHoldingStatementResult {
  en?: string
  bm?: string
  disclaimer: string
  source: 'template' | 'workers-ai'
}

const AI_DISCLAIMER =
  'AI-drafted suggestion only — not legal advice and not fact-checked. Legal/Company Secretary review and Decision Quorum clearance required before release.'

/**
 * AI-assisted drafting, layered on top of the deterministic template —
 * never replacing it as the fallback. Severity/regulatory classification
 * (decisionIntelligence.ts) stays rules-only on purpose: that's
 * compliance-sensitive domain knowledge (Bursa deadlines, PDPA windows) an
 * LLM should never originate. A holding statement's cautious, non-committal
 * register is exactly what a model is good at and safe for, especially
 * with a hard disclaimer and mandatory Quorum clearance already built into
 * the product regardless of source.
 *
 * Degrades to `createHoldingStatement` (the template) whenever `env.AI` is
 * unconfigured, the model call throws, or its output can't be parsed —
 * same graceful-fallback shape as every other AI/Access-gated path in this
 * API. Never throws itself.
 */
export async function draftHoldingStatement(
  env: { AI?: Ai },
  opts: DraftHoldingStatementInput
): Promise<DraftHoldingStatementResult> {
  if (!env.AI) return { ...createHoldingStatement(opts), source: 'template' }

  try {
    const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        {
          role: 'system',
          content:
            'You draft cautious corporate holding statements for a Malaysian crisis-response tool. ' +
            'Rules: 2-3 sentences per language. Never admit fault or liability. Never invent facts beyond ' +
            'what is given. Never state a regulatory conclusion or deadline. Promise a follow-up once facts ' +
            'are verified. Match the register of an official corporate statement, not marketing copy. ' +
            'Output EXACTLY this format and nothing else:\nEN: <english statement>\nBM: <Bahasa Malaysia statement>',
        },
        {
          role: 'user',
          content: [
            `Company: ${opts.company}`,
            `Scenario type: ${opts.scenario}`,
            `Issue (one line): ${opts.issue}`,
            opts.facts ? `Additional facts: ${opts.facts}` : null,
          ]
            .filter(Boolean)
            .join('\n'),
        },
      ],
    })

    const text = typeof result === 'string' ? result : (result as { response?: string } | null)?.response
    const parsed = text ? parseEnBm(text) : null
    if (!parsed?.en && !parsed?.bm) return { ...createHoldingStatement(opts), source: 'template' }

    const out: DraftHoldingStatementResult = { disclaimer: AI_DISCLAIMER, source: 'workers-ai' }
    if (opts.lang !== 'bm') out.en = parsed.en
    if (opts.lang !== 'en') out.bm = parsed.bm
    if (!out.en && !out.bm) return { ...createHoldingStatement(opts), source: 'template' }
    return out
  } catch {
    // Model error, timeout, quota, malformed output — never block the feature on this.
    return { ...createHoldingStatement(opts), source: 'template' }
  }
}

function parseEnBm(text: string): { en?: string; bm?: string } {
  const enMatch = text.match(/EN:\s*(.+?)(?:\n\s*BM:|$)/is)
  const bmMatch = text.match(/BM:\s*(.+)$/is)
  return { en: enMatch?.[1]?.trim(), bm: bmMatch?.[1]?.trim() }
}
