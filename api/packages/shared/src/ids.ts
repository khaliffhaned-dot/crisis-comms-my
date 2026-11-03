export function id(prefix: string): string {
  const rand = crypto.randomUUID().replace(/-/g, '').slice(0, 12).toUpperCase()
  return `${prefix}_${rand}`
}

export function nowIso(): string {
  return new Date().toISOString()
}
