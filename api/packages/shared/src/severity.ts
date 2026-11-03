import type { Severity } from './types'

export interface SeverityProfile {
  level: Severity
  en: string
  bm: string
  bursaAssessment: boolean
  actionEn: string
  actionBm: string
}

export const SEVERITY: Record<Severity, SeverityProfile> = {
  1: {
    level: 1,
    en: 'Level 1 – Routine Operational Issue',
    bm: 'Tahap 1 – Isu Operasi Biasa',
    bursaAssessment: false,
    actionEn: 'Monitor. Prepare holding language if needed.',
    actionBm: 'Pantau. Sediakan bahasa kenyataan awal jika perlu.',
  },
  2: {
    level: 2,
    en: 'Level 2 – Moderate Incident',
    bm: 'Tahap 2 – Insiden Sederhana',
    bursaAssessment: false,
    actionEn: 'Activate core Crisis Team. Issue holding statement. Intensify monitoring.',
    actionBm: 'Aktifkan Pasukan Krisis teras. Keluarkan kenyataan awal. Perhebat pemantauan.',
  },
  3: {
    level: 3,
    en: 'Level 3 – Material Crisis',
    bm: 'Tahap 3 – Krisis Material',
    bursaAssessment: true,
    actionEn: 'Full activation. Notify Board. Assess Bursa disclosure obligation.',
    actionBm: 'Pengaktifan penuh. Maklum Lembaga. Nilai kewajipan pendedahan Bursa.',
  },
  4: {
    level: 4,
    en: 'Level 4 – Critical Crisis',
    bm: 'Tahap 4 – Krisis Kritikal',
    bursaAssessment: true,
    actionEn: 'Highest-level response. Continuous Board and regulatory engagement.',
    actionBm: 'Respons tahap tertinggi. Penglibatan berterusan Lembaga dan pengawal selia.',
  },
}

export interface SeverityInput {
  facts: string
  mediaAttention?: boolean
  possibleMaterialInfo?: boolean
  regulatoryInvolved?: boolean
}

/** Operational heuristic — not legal advice. */
export function recommendSeverity(input: SeverityInput): Severity {
  let level: Severity = 1
  if (input.mediaAttention) level = 2
  if (input.possibleMaterialInfo || input.regulatoryInvolved) level = 3
  if (input.possibleMaterialInfo && input.regulatoryInvolved) level = 4
  return level
}
