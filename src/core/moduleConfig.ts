/** Escalate MY Core — product navigation */

export type CoreSection =
  | 'command'
  | 'incident'
  | 'first60'
  | 'quorum'
  | 'clocks'
  | 'statements'
  | 'audit'
  | 'directory'
  | 'manual'

export interface CoreNavItem {
  id: CoreSection
  en: string
  bm: string
  icon: string
  group: 'core' | 'ref'
}

export const CORE_MODULES: CoreNavItem[] = [
  { id: 'command', en: 'Command Centre', bm: 'Pusat Perintah', icon: '⚡', group: 'core' },
  { id: 'incident', en: 'Incident', bm: 'Insiden', icon: '◆', group: 'core' },
  { id: 'first60', en: 'First 60 min', bm: '60 min pertama', icon: '①', group: 'core' },
  { id: 'quorum', en: 'Decision Quorum', bm: 'Kuorum Keputusan', icon: '◎', group: 'core' },
  { id: 'clocks', en: 'Regulatory Clock', bm: 'Jam Pengawalseliaan', icon: '⏱', group: 'core' },
  { id: 'statements', en: 'Statements', bm: 'Kenyataan', icon: '✎', group: 'core' },
  { id: 'audit', en: 'Audit Trail', bm: 'Jejak Audit', icon: '☰', group: 'core' },
  { id: 'directory', en: 'Directory', bm: 'Direktori', icon: '☎', group: 'core' },
  { id: 'manual', en: 'Manual', bm: 'Manual', icon: '📘', group: 'ref' },
]
