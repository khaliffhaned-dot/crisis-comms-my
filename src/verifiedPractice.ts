/**
 * Verified Malaysian best practice — fact-checked 2 Nov 2026
 * Sources: Bursa Main/ACE LR Ch.9 (as at 31 Oct 2025 / Q&A 20 Oct 2026),
 * PDPA s.12B + Guideline on Data Breach Notification 2025 (effective 1 Jun 2025),
 * Cyber Security Act 2024 + Notification Regulations 2024 (in force 26 Aug 2024),
 * NADOPOD 2004 (DOSH / JKKP).
 * Operational guidance only — not legal advice. Counsel must verify before adoption.
 */

export type VerifyStatus = 'verified' | 'practice' | 'calibrate'

export interface ClockItem {
  id: string
  clockEn: string
  clockBm: string
  deadlineEn: string
  deadlineBm: string
  ownerEn: string
  ownerBm: string
  appliesTo: string
  status: VerifyStatus
  noteEn: string
  noteBm: string
  source: string
}

/** Regulatory clocks — verified against primary/secondary sources */
export const VERIFIED_CLOCKS: ClockItem[] = [
  {
    id: 'bursa-material',
    clockEn: 'Bursa — material information',
    clockBm: 'Bursa — maklumat material',
    deadlineEn: 'Immediate public disclosure',
    deadlineBm: 'Pendedahan awam serta-merta',
    ownerEn: 'Company Secretary',
    ownerBm: 'Setiausaha Syarikat',
    appliesTo: 'All Main & ACE listed issuers',
    status: 'verified',
    noteEn:
      'Main/ACE LR para/Rule 9.03: disclose material information immediately. Material = reasonably expected to affect price/value/market activity or investor choice of action. Bursa LINK before press/social/staff if material. Exception narrow; ends on leak signal (para 9.05/9.06 practice).',
    noteBm:
      'LR Main/ACE 9.03: dedahkan maklumat material serta-merta. Material = dijangka munasabah menjejaskan harga/nilai/aktiviti pasaran atau pilihan tindakan pelabur. Bursa LINK sebelum media/sosial/kakitangan jika material.',
    source: 'Bursa Main LR Ch.9 (as at 31 Oct 2025); ACE Rule 9.03; Continuing Disclosure Guide',
  },
  {
    id: 'bursa-uma',
    clockEn: 'Bursa — UMA / Exchange query',
    clockBm: 'Bursa — pertanyaan UMA / Bursa',
    deadlineEn: 'Immediate response (as required in the query)',
    deadlineBm: 'Respons serta-merta (seperti dalam pertanyaan)',
    ownerEn: 'Company Secretary / CEO',
    ownerBm: 'Setiausaha Syarikat / CEO',
    appliesTo: 'Issuer receiving UMA query',
    status: 'verified',
    noteEn:
      'Main/ACE LR para/Rule 9.11: issuer must immediately respond to UMA query after due enquiry with directors, major shareholders and relevant persons. Reply must meet disclosure standards (factual, clear, accurate).',
    noteBm:
      'LR 9.11: penerbit mesti menjawab pertanyaan UMA serta-merta selepas siasatan wajar dengan pengarah, pemegang saham utama dan pihak berkaitan.',
    source: 'Bursa LR para/Rule 9.11; Bursa UMA Q&A',
  },
  {
    id: 'bursa-halt',
    clockEn: 'Bursa — trading halt request',
    clockBm: 'Bursa — permintaan henti dagangan',
    deadlineEn: 'Same session / as market practice requires',
    deadlineBm: 'Sesi sama / mengikut amalan pasaran',
    ownerEn: 'CEO / Company Secretary',
    ownerBm: 'CEO / Setiausaha Syarikat',
    appliesTo: 'When material info cannot be released in an orderly way',
    status: 'practice',
    noteEn:
      'Trading halt is a tool when material information cannot be disclosed orderly. Request through Company Secretary to the Exchange. Confirm current operational procedures with Bursa / counsel — not a fixed statutory hour in LR text reviewed.',
    noteBm:
      'Henti dagangan digunakan apabila maklumat material tidak dapat diumumkan secara teratur. Minta melalui Setiausaha Syarikat. Sahkan prosedur semasa dengan Bursa / peguam.',
    source: 'Market practice; confirm with Bursa operational guidance',
  },
  {
    id: 'pdpc-breach',
    clockEn: 'PDPC — personal data breach (significant harm)',
    clockBm: 'PDPC — pelanggaran data peribadi (mudarat ketara)',
    deadlineEn: 'As soon as practicable, within 72 hours of becoming aware',
    deadlineBm: 'Secepat praktik, dalam 72 jam dari sedar',
    ownerEn: 'DPO / Legal',
    ownerBm: 'DPO / Undang-undang',
    appliesTo: 'Data controllers under PDPA when breach causes/likely significant harm or >1,000 subjects',
    status: 'verified',
    noteEn:
      'PDPA s.12B + Guideline on Data Breach Notification 2025 (effective 1 Jun 2025). Notify Commissioner via pdp.gov.my / dbnpdp@pdp.gov.my / hard copy. Significant harm includes physical/financial harm, sensitive data, identity-fraud risk, or scale >1,000. Late notice needs written reasons. Penalty up to RM250,000 and/or 2 years.',
    noteBm:
      'PDPA s.12B + Garis Panduan Pemberitahuan Pelanggaran Data 2025 (berkuat kuasa 1 Jun 2025). Maklum Pesuruhjaya dalam 72 jam. Mudarat ketara / skala >1,000. Denda hingga RM250,000 dan/atau 2 tahun.',
    source: 'PDPA Act 709 s.12B; Guideline on Data Breach Notification 2025; pdp.gov.my',
  },
  {
    id: 'pdpa-individuals',
    clockEn: 'PDPA — notify affected individuals',
    clockBm: 'PDPA — maklum individu terjejas',
    deadlineEn: 'Without unnecessary delay, not later than 7 days after notifying Commissioner',
    deadlineBm: 'Tanpa kelengahan yang tidak perlu, tidak lewat 7 hari selepas maklum Pesuruhjaya',
    ownerEn: 'DPO / Comms',
    ownerBm: 'DPO / Komunikasi',
    appliesTo: 'When significant harm to data subjects is likely',
    status: 'verified',
    noteEn:
      'Direct, individual notice in clear language where practicable. Separate from routine messages. Enable subjects to take precautions.',
    noteBm:
      'Notis langsung individu dalam bahasa jelas jika praktik. Berasingan daripada mesej rutin.',
    source: 'Guideline on Data Breach Notification 2025',
  },
  {
    id: 'nacsa-ncii',
    clockEn: 'NACSA — cyber incident (NCII entities only)',
    clockBm: 'NACSA — insiden siber (entiti NCII sahaja)',
    deadlineEn: 'Immediate notice; prescribed particulars within 6 hours; supplementary within 14 days',
    deadlineBm: 'Notis serta-merta; butiran ditetapkan dalam 6 jam; tambahan dalam 14 hari',
    ownerEn: 'CISO / authorised person',
    ownerBm: 'CISO / orang diberi kuasa',
    appliesTo: 'Designated National Critical Information Infrastructure entities only',
    status: 'verified',
    noteEn:
      'Cyber Security Act 2024 (Act 854) s.23 + Cyber Security (Notification of Cyber Security Incident) Regulations 2024 (in force 26 Aug 2024). Clock starts when incident comes to knowledge. Notify NACSA Chief Executive and sector lead electronically; particulars via NC4S within 6 hours; supplementary within 14 days of first notification. Non-NCII may report voluntarily.',
    noteBm:
      'Akta Keselamatan Siber 2024 + Peraturan 2024. Notis serta-merta; butiran dalam 6 jam melalui NC4S; tambahan 14 hari. Hanya entiti NCII diwajibkan.',
    source: 'Act 854; P.U.(A) 220/2024 Regulations',
  },
  {
    id: 'dosh-fatal',
    clockEn: 'DOSH — death, serious injury or dangerous occurrence',
    clockBm: 'JKKP — kematian, cedera serius atau kejadian berbahaya',
    deadlineEn: 'Immediate notice by quickest means; written JKKP 6 within 7 days',
    deadlineBm: 'Notis serta-merta cara terpantas; JKKP 6 bertulis dalam 7 hari',
    ownerEn: 'HSE head / employer',
    ownerBm: 'Ketua HSE / majikan',
    appliesTo: 'All workplaces under OSHA 1994 / NADOPOD 2004',
    status: 'verified',
    noteEn:
      'NADOPOD 2004 reg 5(1): immediate notify nearest DOSH office by fastest means; written report in approved form (JKKP 6) within 7 days. Also: injury causing >4 consecutive calendar days absence → JKKP 6 within 7 days. SOCSO/PERKESO typically within 48 hours (separate regime).',
    noteBm:
      'NADOPOD 2004: notis serta-merta ke pejabat JKKP terdekat; laporan bertulis JKKP 6 dalam 7 hari. PERKESO biasanya dalam 48 jam (rezim berasingan).',
    source: 'NADOPOD 2004; OSHA 1994 s.32; MyKKP portal',
  },
]

/** Bursa-first principle — verified practice */
export const BURSA_FIRST = {
  en: 'Material information is announced immediately through Bursa LINK before press release, social posts, staff note and analyst calls. Equal access is the Exchange expectation under Chapter 9.',
  bm: 'Maklumat material diumumkan serta-merta melalui Bursa LINK sebelum siaran akhbar, sosial, nota kakitangan dan panggilan penganalisis. Akses sama rata adalah jangkaan Bursa di bawah Bab 9.',
  status: 'verified' as VerifyStatus,
  source: 'Main/ACE LR 9.03–9.05; corporate disclosure policy (immediate disclosure + thorough public dissemination)',
}

/** Five-message order — communications best practice (not a statute) */
export const MESSAGE_ORDER = {
  en: ['Acknowledge', 'Care', 'Action', 'Accountability', 'Next update'],
  bm: ['Akui', 'Prihatin', 'Tindakan', 'Akauntabiliti', 'Kemas kini seterusnya'],
  status: 'practice' as VerifyStatus,
  noteEn: 'Industry best practice for holding statements — same facts in EN and BM; never "no comment".',
  noteBm: 'Amalan terbaik industri untuk kenyataan awal — fakta sama dalam BM dan EN; jangan "tiada komen".',
}

/** Insider trading reminder — CMSA (high-level) */
export const INSIDER_LOCK = {
  en: 'Persons with material non-public information must not trade or tip. Company Secretary should issue do-not-trade notice and start an insider log as soon as the Core Five is activated.',
  bm: 'Orang yang mempunyai maklumat material tidak awam tidak boleh dagang atau tip. Setiausaha Syarikat harus keluarkan notis jangan-dagang dan mulakan log orang dalaman sebaik Core Five diaktifkan.',
  status: 'practice' as VerifyStatus,
  source: 'Capital Markets and Services Act 2007 (insider trading provisions); Listing Requirements disclosure + equal access policy',
}

export function statusLabel(s: VerifyStatus, lang: 'en' | 'bm'): string {
  if (lang === 'bm') {
    if (s === 'verified') return 'Disahkan'
    if (s === 'practice') return 'Amalan'
    return 'Kalibrasi'
  }
  if (s === 'verified') return 'Verified'
  if (s === 'practice') return 'Practice'
  return 'Calibrate'
}
