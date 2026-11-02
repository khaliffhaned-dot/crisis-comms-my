/**
 * Escalate MY — complete module set (v1 product scope)
 * Aligned to Crisis Communications Playbook v1.0 + verified MY practice.
 */

export type ShellSection =
  | 'command'
  | 'severity'
  | 'first60'
  | 'clocks'
  | 'statements'
  | 'log'
  | 'corefive'
  | 'manual'

export interface NavItem {
  id: ShellSection
  en: string
  bm: string
  icon: string
  group: 'ops' | 'ref'
  descEn: string
  descBm: string
}

/** Final product modules — keep this list tight */
export const MODULES: NavItem[] = [
  {
    id: 'command',
    en: 'Command',
    bm: 'Perintah',
    icon: '⚡',
    group: 'ops',
    descEn: 'Live incident dashboard, KPIs, monitoring feed',
    descBm: 'Papan pemuka insiden langsung, KPI, suapan pemantauan',
  },
  {
    id: 'severity',
    en: 'Severity',
    bm: 'Keterukan',
    icon: '◆',
    group: 'ops',
    descEn: 'L1–L4 classification, who convenes, who approves',
    descBm: 'Pengelasan T1–T4, siapa bersidang, siapa meluluskan',
  },
  {
    id: 'first60',
    en: 'First 60 min',
    bm: '60 min pertama',
    icon: '①',
    group: 'ops',
    descEn: '13-step sequence with owners and time bands',
    descBm: '13 langkah dengan pemilik dan jalur masa',
  },
  {
    id: 'clocks',
    en: 'Clocks',
    bm: 'Jam',
    icon: '⏱',
    group: 'ops',
    descEn: 'Verified regulatory clocks (Bursa, PDPC, NACSA, DOSH)',
    descBm: 'Jam pengawalseliaan disahkan (Bursa, PDPC, NACSA, JKKP)',
  },
  {
    id: 'statements',
    en: 'Statements',
    bm: 'Kenyataan',
    icon: '✎',
    group: 'ops',
    descEn: 'Holding statement builder — EN/BM, five-message order',
    descBm: 'Pembina kenyataan awal — BM/EN, urutan lima mesej',
  },
  {
    id: 'log',
    en: 'Decision log',
    bm: 'Log keputusan',
    icon: '☰',
    group: 'ops',
    descEn: 'Time-stamped decisions for after-action review',
    descBm: 'Keputusan berwaktu untuk semakan selepas tindakan',
  },
  {
    id: 'corefive',
    en: 'Core Five',
    bm: 'Core Five',
    icon: '◎',
    group: 'ops',
    descEn: 'Who is on the first call and why',
    descBm: 'Siapa dalam panggilan pertama dan mengapa',
  },
  {
    id: 'manual',
    en: 'Manual',
    bm: 'Manual',
    icon: '📘',
    group: 'ref',
    descEn: 'Principles, sources, verification status',
    descBm: 'Prinsip, sumber, status pengesahan',
  },
]

export const OPS_MODULES = MODULES.filter((m) => m.group === 'ops')
export const REF_MODULES = MODULES.filter((m) => m.group === 'ref')
