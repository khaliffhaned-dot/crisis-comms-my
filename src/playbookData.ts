/**
 * Playbook-aligned constants from Crisis Communications Playbook v1.0
 * (Bursa Malaysia Main & ACE Market — draft for adoption, 14 Oct 2026)
 * Operational guidance only — not legal advice. Verify with counsel.
 */

export type Lang = 'bm' | 'en'

export const CORE_FIVE = {
  en: [
    { role: 'Crisis Lead (CEO / MD or delegate)', why: 'Single accountable decision-maker' },
    { role: 'Company Secretary', why: 'Controls Bursa LINK submissions and the statutory record' },
    { role: 'Head of Legal / General Counsel', why: 'Privilege, legal exposure, regulator posture' },
    { role: 'Head of Corporate Communications', why: 'Statements, media, social, languages' },
    { role: 'CFO / Head of Investor Relations', why: 'Market impact, lenders, ratings, shareholders' },
  ],
  bm: [
    { role: 'Ketua Krisis (CEO / MD atau wakil)', why: 'Pembuat keputusan tunggal yang bertanggungjawab' },
    { role: 'Setiausaha Syarikat', why: 'Kawalan penyerahan Bursa LINK dan rekod statutori' },
    { role: 'Ketua Undang-undang / Peguam Cara', why: 'Keistimewaan, pendedahan undang-undang, sikap pengawal selia' },
    { role: 'Ketua Komunikasi Korporat', why: 'Kenyataan, media, sosial, bahasa' },
    { role: 'CFO / Ketua Perhubungan Pelabur', why: 'Kesan pasaran, pemberi pinjaman, penarafan, pemegang saham' },
  ],
}

/** 13-step First 60 Minutes sequence (Playbook §2.1) */
export const FIRST_60_STEPS = {
  en: [
    { band: '0–10 min', step: 1, text: 'Verify and name it — two-line factual summary', owner: 'Person who received the alert', critical: true },
    { band: '0–10 min', step: 2, text: 'Protect people first — safety, containment; Comms never delays life-safety', owner: 'Operations / HSE / CISO', critical: true },
    { band: '0–10 min', step: 3, text: 'Call the Core Five by phone, not email', owner: 'First recipient', critical: true },
    { band: '10–20 min', step: 4, text: 'Freeze — legal hold; pause scheduled posts; no external comment except named spokesperson', owner: 'Legal / Comms', critical: true },
    { band: '10–20 min', step: 5, text: 'Insider lock — do not trade, do not tip; start insider log', owner: 'Company Secretary', critical: true },
    { band: '10–20 min', step: 6, text: 'Start the decision log — time-stamp every decision and reason', owner: 'Scribe', critical: false },
    { band: '20–40 min', step: 7, text: 'Materiality screen — if it might be price-sensitive, treat it as such until counsel says otherwise', owner: 'Disclosure Committee', critical: true },
    { band: '20–40 min', step: 8, text: 'Market-hours check — if material and cannot announce, consider trading halt', owner: 'CEO + Company Secretary', critical: true },
    { band: '20–40 min', step: 9, text: 'Convene the CMT (war room — physical or virtual)', owner: 'Crisis Lead', critical: false },
    { band: '40–60 min', step: 10, text: 'Start every relevant regulatory clock; assign one named owner each', owner: 'Legal / Compliance', critical: true },
    { band: '40–60 min', step: 11, text: 'Notify the Board — Chair and ARC Chair, by phone', owner: 'Crisis Lead', critical: true },
    { band: '40–60 min', step: 12, text: 'Release first words — holding statement + staff note; Bursa first if material', owner: 'Head of Comms', critical: true },
    { band: '40–60 min', step: 13, text: 'Set the next update time (every 60–120 min) and say so publicly', owner: 'Crisis Lead', critical: false },
  ],
  bm: [
    { band: '0–10 min', step: 1, text: 'Sahkan dan namakan — ringkasan fakta dua baris', owner: 'Penerima amaran', critical: true },
    { band: '0–10 min', step: 2, text: 'Lindungi orang dahulu — keselamatan, penahanan; Komunikasi tidak melambatkan tindakan hayat', owner: 'Operasi / HSE / CISO', critical: true },
    { band: '0–10 min', step: 3, text: 'Hubungi Core Five melalui telefon, bukan e-mel', owner: 'Penerima pertama', critical: true },
    { band: '10–20 min', step: 4, text: 'Beku — legal hold; henti siaran terjadual; tiada komen luaran kecuali jurucakap dinamakan', owner: 'Undang-undang / Komunikasi', critical: true },
    { band: '10–20 min', step: 5, text: 'Kunci orang dalaman — jangan dagang, jangan tip; mulakan log orang dalaman', owner: 'Setiausaha Syarikat', critical: true },
    { band: '10–20 min', step: 6, text: 'Mulakan log keputusan — cap masa setiap keputusan dan alasan', owner: 'Juru tulis', critical: false },
    { band: '20–40 min', step: 7, text: 'Saringan materialiti — jika mungkin sensitif harga, anggap demikian sehingga peguam menyatakan sebaliknya', owner: 'Jawatankuasa Pendedahan', critical: true },
    { band: '20–40 min', step: 8, text: 'Semak waktu pasaran — jika material dan tidak boleh umumkan, pertimbang henti dagangan', owner: 'CEO + Setiausaha Syarikat', critical: true },
    { band: '20–40 min', step: 9, text: 'Kumpulkan CMT (bilik perang — fizikal atau maya)', owner: 'Ketua Krisis', critical: false },
    { band: '40–60 min', step: 10, text: 'Mulakan setiap jam pengawalseliaan yang relevan; namakan seorang pemilik setiap jam', owner: 'Undang-undang / Pematuhan', critical: true },
    { band: '40–60 min', step: 11, text: 'Maklumkan Lembaga — Pengerusi dan Pengerusi ARC, melalui telefon', owner: 'Ketua Krisis', critical: true },
    { band: '40–60 min', step: 12, text: 'Keluarkan kata-kata pertama — kenyataan awal + nota kakitangan; Bursa dahulu jika material', owner: 'Ketua Komunikasi', critical: true },
    { band: '40–60 min', step: 13, text: 'Tetapkan masa kemas kini seterusnya (setiap 60–120 min) dan nyatakan secara awam', owner: 'Ketua Krisis', critical: false },
  ],
}

/** Severity matrix aligned to Playbook §7.2 */
export const SEVERITY_DATA = {
  1: {
    en: 'Level 1 – Issue',
    bm: 'Tahap 1 – Isu',
    shortEn: 'Contained, local, low visibility',
    shortBm: 'Terkawal, tempatan, keterlihatan rendah',
    actionEn: 'Head of function manages. Function head + Comms approve statements.',
    actionBm: 'Ketua fungsi mengurus. Ketua fungsi + Komunikasi meluluskan kenyataan.',
    criteriaEn: ['Minor first-aid only', 'No market effect', 'Single outlet, low reach', 'Routine notification'],
    criteriaBm: ['Pertolongan cemas ringan sahaja', 'Tiada kesan pasaran', 'Satu saluran, jangkauan rendah', 'Pemberitahuan rutin'],
    notifyEn: ['Head of function', 'Comms Officer'],
    notifyBm: ['Ketua fungsi', 'Pegawai Komunikasi'],
    convenesEn: 'Head of function',
    convenesBm: 'Ketua fungsi',
    approvesEn: 'Function head + Comms',
    approvesBm: 'Ketua fungsi + Komunikasi',
    bursa: false,
  },
  2: {
    en: 'Level 2 – Incident',
    bm: 'Tahap 2 – Insiden',
    shortEn: 'Notable; business unit manages with HQ support',
    shortBm: 'Ketara; unit perniagaan urus dengan sokongan HQ',
    actionEn: 'Core Five convenes (virtual). Comms + Legal approve statements. Any Core Five member may declare L2 on own authority.',
    actionBm: 'Core Five bersidang (maya). Komunikasi + Undang-undang meluluskan. Mana-mana ahli Core Five boleh isytihar T2 atas kuasa sendiri.',
    criteriaEn: ['Injury requiring treatment', 'Unusual market chatter', 'Several outlets; trending locally', 'Formal regulator enquiry'],
    criteriaBm: ['Kecederaan memerlukan rawatan', 'Bising pasaran luar biasa', 'Beberapa saluran; trending tempatan', 'Siasatan formal pengawal selia'],
    notifyEn: ['Crisis Lead', 'Company Secretary', 'Legal', 'Comms', 'CFO / IR'],
    notifyBm: ['Ketua Krisis', 'Setiausaha Syarikat', 'Undang-undang', 'Komunikasi', 'CFO / IR'],
    convenesEn: 'Core Five (virtual)',
    convenesBm: 'Core Five (maya)',
    approvesEn: 'Comms + Legal',
    approvesBm: 'Komunikasi + Undang-undang',
    bursa: false,
  },
  3: {
    en: 'Level 3 – Crisis',
    bm: 'Tahap 3 – Krisis',
    shortEn: 'Significant; threatens brand, licence or share price',
    shortBm: 'Signifikan; ancam jenama, lesen atau harga saham',
    actionEn: 'Full CMT; Board Chair told. Crisis Lead + Legal + CoSec approve. Bursa disclosure assessment mandatory.',
    actionBm: 'CMT penuh; Pengerusi Lembaga dimaklumkan. Ketua Krisis + Undang-undang + CoSec luluskan. Penilaian pendedahan Bursa wajib.',
    criteriaEn: ['Fatality or multiple serious injuries', 'UMA query likely/received; halt considered', 'National media; viral', 'Any 3R-adjacent content = at least L3'],
    criteriaBm: ['Kematian atau kecederaan serius berbilang', 'UMA berkemungkinan; henti dipertimbang', 'Media nasional; viral', 'Sebarang kandungan 3R = sekurang-kurangnya T3'],
    notifyEn: ['Board Chair', 'ARC Chair', 'CEO', 'Company Secretary', 'Crisis Lead', 'Legal'],
    notifyBm: ['Pengerusi Lembaga', 'Pengerusi ARC', 'CEO', 'Setiausaha Syarikat', 'Ketua Krisis', 'Undang-undang'],
    convenesEn: 'Full CMT; Board Chair told',
    convenesBm: 'CMT penuh; Pengerusi Lembaga dimaklumkan',
    approvesEn: 'Crisis Lead + Legal + CoSec',
    approvesBm: 'Ketua Krisis + Undang-undang + CoSec',
    bursa: true,
  },
  4: {
    en: 'Level 4 – Critical',
    bm: 'Tahap 4 – Kritikal',
    shortEn: 'Existential or systemic; threat to continuity, licence, solvency or leadership',
    shortBm: 'Wujud atau sistemik; ancam kesinambungan, lesen, kesolvenan atau kepimpinan',
    actionEn: 'Board convened; external advisers on site. Crisis Lead + Chair/Board approve. Continuous regulatory engagement.',
    actionBm: 'Lembaga dikumpulkan; penasihat luar di lokasi. Ketua Krisis + Pengerusi/Lembaga luluskan. Penglibatan pengawal selia berterusan.',
    criteriaEn: ['Multiple fatalities; widespread public harm', 'Halt required; PN17 / delisting risk', 'Sustained national and international coverage', 'Raids/arrests; licence revocation risk'],
    criteriaBm: ['Kematian berbilang; kemudaratan awam meluas', 'Henti diperlukan; risiko PN17 / dinyahsenarai', 'Liputan nasional dan antarabangsa berterusan', 'Serbuan/tangkapan; risiko pembatalan lesen'],
    notifyEn: ['Full Board', 'CEO', 'Regulators as required', 'External counsel', 'Crisis Team'],
    notifyBm: ['Lembaga penuh', 'CEO', 'Pengawal selia jika perlu', 'Peguam luar', 'Pasukan Krisis'],
    convenesEn: 'Full CMT; Board convened; external advisers',
    convenesBm: 'CMT penuh; Lembaga dikumpulkan; penasihat luar',
    approvesEn: 'Crisis Lead + Chair / Board',
    approvesBm: 'Ketua Krisis + Pengerusi / Lembaga',
    bursa: true,
  },
} as const

/** Five-message order (Playbook executive summary §5) */
export const MESSAGE_FRAMEWORK = {
  en: ['Acknowledge', 'Care', 'Action', 'Accountability', 'Next'],
  bm: ['Akui', 'Prihatin', 'Tindakan', 'Akauntabiliti', 'Seterusnya'],
}

/** Regulatory clocks (Playbook §2.3) — indicative; verify with counsel */
export const REGULATORY_CLOCKS = {
  en: [
    { clock: 'Bursa — material information', deadline: 'Immediately', owner: 'Company Secretary' },
    { clock: 'Bursa — UMA / Exchange query', deadline: 'As stated in query', owner: 'Company Secretary / CEO' },
    { clock: 'Bursa — trading halt request', deadline: 'Same day (typical)', owner: 'CEO / Company Secretary' },
    { clock: 'PDPC — personal data breach', deadline: 'Within 72 hours', owner: 'DPO / Legal' },
    { clock: 'PDPA — affected individuals', deadline: 'No later than 7 days after PDPC', owner: 'DPO / Comms' },
    { clock: 'NACSA — cyber (NCII only)', deadline: 'Immediate; fuller within 6 hours', owner: 'CISO' },
    { clock: 'DOSH — workplace death/serious injury', deadline: 'Immediately; written within 7 days', owner: 'HSE head' },
  ],
  bm: [
    { clock: 'Bursa — maklumat material', deadline: 'Serta-merta', owner: 'Setiausaha Syarikat' },
    { clock: 'Bursa — pertanyaan UMA / Bursa', deadline: 'Seperti dinyatakan dalam pertanyaan', owner: 'Setiausaha Syarikat / CEO' },
    { clock: 'Bursa — permintaan henti dagangan', deadline: 'Hari yang sama (lazim)', owner: 'CEO / Setiausaha Syarikat' },
    { clock: 'PDPC — pelanggaran data peribadi', deadline: 'Dalam 72 jam', owner: 'DPO / Undang-undang' },
    { clock: 'PDPA — individu terjejas', deadline: 'Tidak lewat 7 hari selepas PDPC', owner: 'DPO / Komunikasi' },
    { clock: 'NACSA — siber (NCII sahaja)', deadline: 'Serta-merta; penuh dalam 6 jam', owner: 'CISO' },
    { clock: 'DOSH — kematian/kecederaan serius di tempat kerja', deadline: 'Serta-merta; bertulis dalam 7 hari', owner: 'Ketua HSE' },
  ],
}

/** Six executive messages of the playbook */
export const SIX_MESSAGES = {
  en: [
    'Run the first 60 minutes in order',
    'Bursa first, everyone else second',
    'Settle who decides before the crisis',
    'Start every regulatory clock at once',
    'Say five things, in the same order, everywhere',
    'Prepare, rehearse, then review',
  ],
  bm: [
    'Jalankan 60 minit pertama mengikut urutan',
    'Bursa dahulu, yang lain kemudian',
    'Tetapkan siapa yang memutuskan sebelum krisis',
    'Mulakan setiap jam pengawalseliaan sekaligus',
    'Katakan lima perkara, dalam urutan yang sama, di mana-mana',
    'Sedia, latihan, kemudian semak',
  ],
}
