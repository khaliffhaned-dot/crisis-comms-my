export function relativeTime(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const mins = Math.round(ms / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`
  const days = Math.round(hours / 24)
  return `${days} day${days === 1 ? '' : 's'} ago`
}

export function elapsedMinutes(iso: string): number {
  return Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000))
}

export interface SeverityMeta {
  level: 1 | 2 | 3 | 4
  name: string
  tone: 'l1' | 'l2' | 'l3' | 'l4'
}

const SEVERITY_META: Record<number, SeverityMeta> = {
  1: { level: 1, name: 'Low', tone: 'l1' },
  2: { level: 2, name: 'Moderate', tone: 'l2' },
  3: { level: 3, name: 'Material', tone: 'l3' },
  4: { level: 4, name: 'Critical', tone: 'l4' },
}

export function severityMeta(severity: number | null): SeverityMeta | null {
  if (!severity) return null
  return SEVERITY_META[severity] ?? null
}
