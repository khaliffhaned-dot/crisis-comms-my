/** Escalate MY Core — product navigation */
import type { ComponentType } from 'react'
import {
  CommandCentreIcon,
  IncidentIcon,
  TimelineIcon,
  ApprovalIcon,
  ClockIcon,
  ReportIcon,
  NotificationIcon,
  AuditIcon,
  TeamIcon,
  DecisionIcon,
  RegulationIcon,
  EvidenceIcon,
  type EscalateIconProps,
} from './icons/EscalateIcons'

export type CoreSection =
  | 'command'
  | 'incident'
  | 'first60'
  | 'quorum'
  | 'clocks'
  | 'statements'
  | 'signals'
  | 'audit'
  | 'directory'
  | 'manual'
  | 'decision-intel'
  | 'regulatory-intel'
  | 'board-intel'

export interface CoreNavItem {
  id: CoreSection
  en: string
  bm: string
  /** Escalate Icon Set component (src/core/icons/EscalateIcons.tsx) — replaces
   * the raw Unicode glyphs this file used to carry, flagged in .ux-profile.md
   * as debt to fix on next touch. 'manual' keeps its emoji glyph: it isn't a
   * governance concept the icon set covers, and forcing a fit would be worse
   * than leaving one honest exception. */
  icon: ComponentType<EscalateIconProps> | string
  group: 'core' | 'intel' | 'ref'
}

export const CORE_MODULES: CoreNavItem[] = [
  { id: 'command', en: 'Command Centre', bm: 'Pusat Perintah', icon: CommandCentreIcon, group: 'core' },
  { id: 'incident', en: 'Incident', bm: 'Insiden', icon: IncidentIcon, group: 'core' },
  { id: 'first60', en: 'First 60 min', bm: '60 min pertama', icon: TimelineIcon, group: 'core' },
  { id: 'quorum', en: 'Decision Quorum', bm: 'Kuorum Keputusan', icon: ApprovalIcon, group: 'core' },
  { id: 'clocks', en: 'Regulatory Clock', bm: 'Jam Pengawalseliaan', icon: ClockIcon, group: 'core' },
  { id: 'statements', en: 'Statements', bm: 'Kenyataan', icon: ReportIcon, group: 'core' },
  { id: 'signals', en: 'Signals', bm: 'Isyarat', icon: NotificationIcon, group: 'core' },
  { id: 'audit', en: 'Audit Trail', bm: 'Jejak Audit', icon: AuditIcon, group: 'core' },
  { id: 'directory', en: 'Directory', bm: 'Direktori', icon: TeamIcon, group: 'core' },
  { id: 'decision-intel', en: 'Decision Intelligence', bm: 'Kepintaran Keputusan', icon: DecisionIcon, group: 'intel' },
  { id: 'regulatory-intel', en: 'Regulatory Intelligence', bm: 'Kepintaran Kawal Selia', icon: RegulationIcon, group: 'intel' },
  { id: 'board-intel', en: 'Board Intelligence', bm: 'Kepintaran Lembaga', icon: EvidenceIcon, group: 'intel' },
  { id: 'manual', en: 'Manual', bm: 'Manual', icon: '📘', group: 'ref' },
]
