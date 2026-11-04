/**
 * Approved Responses™ — a curated library of PLC-grade corporate statement
 * templates, distinct from the free-form AI-assisted holding statement
 * drafting in holding.ts. The two serve different jobs:
 *
 * - holding.ts (createHoldingStatement / draftHoldingStatement): a
 *   situational first draft for a *specific* incident's facts, optionally
 *   AI-assisted (Workers AI) because the wording genuinely needs to vary
 *   incident to incident.
 * - This file: standardised, legally-vetted boilerplate for each stage of
 *   a response (first holding statement, recall, regulatory disclosure,
 *   update, closure, social) that a PLC's Legal/Corporate Affairs team
 *   would pre-approve the WORDING of, not just the facts. Deliberately
 *   never AI-generated — regenerating or paraphrasing pre-approved legal
 *   language would defeat the entire point of having it pre-approved.
 *   Placeholders are filled from real incident data where the data model
 *   actually has it; anything it doesn't (e.g. a product name) is left as
 *   a literal bracketed placeholder for manual completion rather than
 *   invented.
 *
 * Drafting one of these never publishes it anywhere — same as every other
 * "recommendation" in this product, release still goes through Decision
 * Quorum (Legal and Corporate Affairs are already-defined QuorumRole
 * values) before anything leaves the building.
 */

import { ValidationError } from '@escalate-my/shared'

export type ApprovedResponseType =
  | 'holding'
  | 'product_recall'
  | 'material_disclosure'
  | 'crisis_update'
  | 'incident_closure'
  | 'social_media'

export type Audience = 'Regulator' | 'Media' | 'Customer' | 'Employee' | 'Board' | 'Social Media'

interface ApprovedResponseTemplate {
  type: ApprovedResponseType
  label_en: string
  label_bm: string
  /** Who this is written for — used to filter the catalog by audience in
   * the UI. One type can fit more than one audience (a holding statement
   * is released to media but just as readable by a regulator). */
  audiences: Audience[]
  en: string
  bm: string
}

/** Placeholder tokens used verbatim inside the EN/BM copy below. English
 * and Bahasa Malaysia use different bracket text for the same concept
 * (e.g. "[DATE]" vs "[TARIKH]"), so each language's placeholders are
 * replaced independently — there is no shared token between the two. */
export interface ApprovedResponseFields {
  organisationName: string
  /** Fills [INCIDENT SUMMARY] / [RINGKASAN INSIDEN], [INCIDENT] / [INSIDEN],
   * and [MATTER] / [PERKARA] — the three EN labels (and their BM
   * equivalents) all stand for the same thing across the five templates
   * that use one of them, so one field covers all three. */
  incidentSummary: string
  /** Pre-formatted — this module does no date math or locale formatting. */
  date: string
  /** Only used by the product recall template; left as a literal
   * placeholder if omitted, since there's no product-name field on an
   * incident to auto-populate it from. */
  productName?: string
  /** Up to 3 bullet actions for the Crisis Update template, e.g. the most
   * recently completed First 60 Minutes steps. Any slot left unfilled
   * keeps its literal [ACTION n] / [TINDAKAN n] placeholder — never
   * fabricated. */
  actions?: [string?, string?, string?]
}

export const APPROVED_RESPONSE_TEMPLATES: Record<ApprovedResponseType, ApprovedResponseTemplate> = {
  holding: {
    type: 'holding',
    label_en: 'Holding Statement',
    label_bm: 'Kenyataan Media',
    audiences: ['Media', 'Regulator'],
    en: `MEDIA STATEMENT

[ORGANISATION NAME] confirms that an incident involving [INCIDENT SUMMARY] is currently under investigation.

Upon becoming aware of the matter, the organisation activated its incident management procedures and immediately commenced the necessary assessment and response measures.

Based on information available at this stage, there is no evidence indicating an immediate risk to public safety. However, investigations remain ongoing to ensure all relevant facts are established and verified.

The organisation will continue to cooperate with the relevant authorities, regulators and stakeholders.

Additional information will be provided once the verification process has been completed.

End`,
    bm: `KENYATAAN MEDIA

[NAMA ORGANISASI] mengesahkan bahawa satu insiden melibatkan [RINGKASAN INSIDEN] sedang disiasat.

Sejurus selepas insiden tersebut dikenal pasti, organisasi telah mengaktifkan prosedur pengurusan insiden serta mengambil langkah-langkah yang sewajarnya bagi menilai keadaan dan mendapatkan maklumat yang tepat.

Berdasarkan maklumat yang diperoleh setakat ini, tiada bukti yang menunjukkan sebarang risiko segera terhadap keselamatan awam. Walau bagaimanapun, siasatan lanjut masih diteruskan bagi memastikan semua fakta yang berkaitan dapat disahkan.

Organisasi akan terus bekerjasama dengan pihak berkuasa, badan kawal selia dan pihak berkepentingan yang berkaitan.

Maklumat lanjut akan dikemukakan apabila proses pengesahan selesai dilaksanakan.

Tamat`,
  },

  product_recall: {
    type: 'product_recall',
    label_en: 'Product Recall Statement',
    label_bm: 'Kenyataan Penarikan Balik Produk',
    audiences: ['Customer', 'Media'],
    en: `PRODUCT RECALL STATEMENT

[ORGANISATION NAME] is initiating a voluntary recall of [PRODUCT NAME] following the identification of an issue requiring further investigation.

The recall is being conducted as a precautionary measure while technical assessments and detailed investigations are carried out.

Customers in possession of the affected product are advised to discontinue use and refer to the organisation's official channels for further guidance.

Safety and customer wellbeing remain the organisation's highest priority.

End`,
    bm: `KENYATAAN PENARIKAN BALIK PRODUK

[NAMA ORGANISASI] mengumumkan pelaksanaan penarikan balik secara sukarela bagi produk [NAMA PRODUK] susulan penemuan yang memerlukan penelitian lanjut.

Langkah ini diambil sebagai langkah berjaga-jaga sementara penilaian teknikal dan siasatan terperinci dijalankan.

Pelanggan yang memiliki produk terlibat dinasihatkan untuk menghentikan penggunaan produk berkenaan dan merujuk saluran rasmi organisasi bagi mendapatkan panduan lanjut.

Keselamatan dan kebajikan pengguna kekal sebagai keutamaan utama organisasi.

Tamat`,
  },

  material_disclosure: {
    type: 'material_disclosure',
    label_en: 'Bursa / Material Disclosure',
    label_bm: 'Pendedahan Material',
    audiences: ['Regulator', 'Board'],
    en: `MATERIAL DISCLOSURE

The organisation wishes to announce that an incident involving [MATTER] was identified on [DATE].

Management is currently assessing the potential impact on operations, financial position, regulatory compliance and corporate reputation.

The incident response plan has been activated and mitigation measures are being implemented.

The overall impact remains under assessment. Any material developments requiring additional disclosure will be announced in accordance with applicable regulatory requirements.

End`,
    bm: `PENDEDAHAN MATERIAL

Organisasi ingin memaklumkan bahawa satu insiden melibatkan [PERKARA] telah dikenal pasti pada [TARIKH].

Pihak pengurusan sedang menilai implikasi yang mungkin timbul terhadap operasi, kedudukan kewangan, pematuhan peraturan serta reputasi organisasi.

Pelan tindak balas telah diaktifkan dan langkah-langkah mitigasi sedang dilaksanakan.

Pada masa ini, impak keseluruhan masih dalam penilaian. Sebarang perkembangan material yang memerlukan pendedahan lanjut akan diumumkan selaras dengan keperluan peraturan yang berkuat kuasa.

Tamat`,
  },

  crisis_update: {
    type: 'crisis_update',
    label_en: 'Crisis Update',
    label_bm: 'Kemas Kini Situasi',
    audiences: ['Media', 'Board', 'Employee'],
    en: `SITUATION UPDATE

Reference is made to the earlier statement regarding [INCIDENT].

Investigations and response activities remain ongoing. Based on information currently verified:

• [ACTION 1]
• [ACTION 2]
• [ACTION 3]

The organisation remains committed to managing the situation in a transparent, responsible and accountable manner.

Further updates will be provided as additional verified information becomes available.

End`,
    bm: `KEMAS KINI SITUASI

Merujuk kepada kenyataan terdahulu berhubung insiden [INSIDEN].

Siasatan dan tindakan susulan masih diteruskan. Berdasarkan maklumat yang disahkan setakat ini:

• [TINDAKAN 1]
• [TINDAKAN 2]
• [TINDAKAN 3]

Organisasi kekal komited untuk menguruskan situasi ini secara telus, bertanggungjawab dan selaras dengan keperluan pihak berkuasa yang berkaitan.

Maklumat lanjut akan dikongsikan apabila tersedia.

Tamat`,
  },

  incident_closure: {
    type: 'incident_closure',
    label_en: 'Incident Closure',
    label_bm: 'Kenyataan Penutupan Insiden',
    audiences: ['Board', 'Regulator', 'Employee'],
    en: `INCIDENT CLOSURE STATEMENT

Reference is made to the incident involving [INCIDENT] reported on [DATE].

The investigation, assessment and corrective actions relating to the matter have been completed.

Additional preventive and monitoring measures have also been implemented to minimise the likelihood of recurrence.

The organisation extends its appreciation to all stakeholders for their cooperation throughout the incident management process.

The organisation remains committed to the principles of safety, integrity and transparency across all aspects of its operations.

End`,
    bm: `KENYATAAN PENUTUPAN INSIDEN

Merujuk kepada insiden [INSIDEN] yang dilaporkan pada [TARIKH].

Proses siasatan, penilaian serta tindakan pembetulan yang berkaitan telah diselesaikan.

Langkah-langkah pencegahan dan pemantauan tambahan turut dilaksanakan bagi mengurangkan risiko berulang pada masa hadapan.

Organisasi merakamkan penghargaan kepada semua pihak yang telah memberikan kerjasama sepanjang tempoh pengurusan insiden ini.

Organisasi kekal komited terhadap prinsip keselamatan, integriti dan ketelusan dalam setiap aspek operasinya.

Tamat`,
  },

  social_media: {
    type: 'social_media',
    label_en: 'Short Social Media Version',
    label_bm: 'Versi Media Sosial Ringkas',
    audiences: ['Social Media'],
    en: `UPDATE

We are currently managing and investigating an incident involving [INCIDENT].

Relevant response teams have been activated and appropriate actions are being taken.

Further updates will be provided once information has been verified.`,
    bm: `KEMAS KINI

Kami sedang mengurus dan menyiasat insiden melibatkan [INSIDEN].

Pasukan yang berkaitan telah diaktifkan dan tindakan sewajarnya sedang dilaksanakan.

Maklumat lanjut akan dikongsikan selepas pengesahan dibuat.`,
  },
}

const DISCLAIMER =
  'Approved template — wording pre-set, not AI-generated. Legal / Corporate Affairs clearance via Decision Quorum required before release.'

function fillEn(text: string, fields: ApprovedResponseFields): string {
  const actions = fields.actions ?? []
  return text
    .replace(/\[ORGANISATION NAME\]/g, fields.organisationName)
    .replace(/\[INCIDENT SUMMARY\]/g, fields.incidentSummary)
    .replace(/\[INCIDENT\]/g, fields.incidentSummary)
    .replace(/\[MATTER\]/g, fields.incidentSummary)
    .replace(/\[DATE\]/g, fields.date)
    .replace(/\[PRODUCT NAME\]/g, fields.productName || '[PRODUCT NAME]')
    .replace(/\[ACTION 1\]/g, actions[0] || '[ACTION 1]')
    .replace(/\[ACTION 2\]/g, actions[1] || '[ACTION 2]')
    .replace(/\[ACTION 3\]/g, actions[2] || '[ACTION 3]')
}

function fillBm(text: string, fields: ApprovedResponseFields): string {
  const actions = fields.actions ?? []
  return text
    .replace(/\[NAMA ORGANISASI\]/g, fields.organisationName)
    .replace(/\[RINGKASAN INSIDEN\]/g, fields.incidentSummary)
    .replace(/\[INSIDEN\]/g, fields.incidentSummary)
    .replace(/\[PERKARA\]/g, fields.incidentSummary)
    .replace(/\[TARIKH\]/g, fields.date)
    .replace(/\[NAMA PRODUK\]/g, fields.productName || '[NAMA PRODUK]')
    .replace(/\[TINDAKAN 1\]/g, actions[0] || '[TINDAKAN 1]')
    .replace(/\[TINDAKAN 2\]/g, actions[1] || '[TINDAKAN 2]')
    .replace(/\[TINDAKAN 3\]/g, actions[2] || '[TINDAKAN 3]')
}

/** incident.created_at is a full ISO timestamp; a legal statement needs just
 * the calendar date, and a plain ISO (YYYY-MM-DD) sidesteps locale/Intl
 * availability questions on Workers for no real loss of clarity. */
export function isoDateOnly(iso: string): string {
  return iso.slice(0, 10)
}

export function listApprovedResponseTypes(audience?: Audience) {
  const all = Object.values(APPROVED_RESPONSE_TEMPLATES)
  const filtered = audience ? all.filter((t) => t.audiences.includes(audience)) : all
  return filtered.map((t) => ({
    type: t.type,
    label_en: t.label_en,
    label_bm: t.label_bm,
    audiences: t.audiences,
  }))
}

export function renderApprovedResponse(
  type: ApprovedResponseType,
  lang: 'en' | 'bm' | 'both',
  fields: ApprovedResponseFields
): { en?: string; bm?: string; type: ApprovedResponseType; disclaimer: string } {
  const tpl = APPROVED_RESPONSE_TEMPLATES[type]
  if (!tpl) throw new ValidationError(`Unknown approved response type: ${type}`)
  const out: { en?: string; bm?: string; type: ApprovedResponseType; disclaimer: string } = {
    type,
    disclaimer: DISCLAIMER,
  }
  if (lang !== 'bm') out.en = fillEn(tpl.en, fields)
  if (lang !== 'en') out.bm = fillBm(tpl.bm, fields)
  return out
}
