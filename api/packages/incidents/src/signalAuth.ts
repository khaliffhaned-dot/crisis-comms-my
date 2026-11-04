import type { Env } from '@escalate-my/shared'

/**
 * Per-organisation shared-secret for the signal intake endpoint (POST
 * /api/v1/signals) — the credential an org's IT/vendor admin pastes into
 * Meltwater, Sentinel, ServiceNow, etc. when configuring an outbound
 * webhook. Deliberately separate from orgSettings.ts: that module holds
 * display settings meant to be read back and shown in the UI; this is a
 * secret that must never be re-displayed after generation, so it gets its
 * own narrow read (status only) / write (rotate) surface.
 *
 * Stored in the same CONFIG KV namespace as org settings — same
 * read-heavy (checked on every inbound signal), rarely-written
 * (rotated occasionally by an admin) shape.
 */
export interface SignalKeyStatus {
  configured: boolean
  generated_at: string | null
}

function kvKey(organisationId: string): string {
  return `signal-key:${organisationId}`
}

interface StoredKey {
  key: string
  generated_at: string
}

async function readStored(env: Env, organisationId: string): Promise<StoredKey | null> {
  const raw = await env.CONFIG.get(kvKey(organisationId))
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as Partial<StoredKey>
    if (typeof parsed.key !== 'string' || typeof parsed.generated_at !== 'string') return null
    return { key: parsed.key, generated_at: parsed.generated_at }
  } catch {
    return null
  }
}

function generateKey(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  const hex = Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('')
  return `sig_${hex}`
}

/** Status only — never returns the key itself. Safe to call from any read path. */
export async function getSignalKeyStatus(env: Env, organisationId: string): Promise<SignalKeyStatus> {
  const stored = await readStored(env, organisationId)
  return { configured: !!stored, generated_at: stored?.generated_at ?? null }
}

/**
 * Generates a new key (replacing any existing one) and returns it in full
 * — the only time it is ever returned. The caller (an Admin, via the
 * route handler) must copy it immediately; it cannot be retrieved again,
 * only rotated.
 */
export async function rotateSignalKey(env: Env, organisationId: string): Promise<{ key: string; generated_at: string }> {
  const key = generateKey()
  const generated_at = new Date().toISOString()
  await env.CONFIG.put(kvKey(organisationId), JSON.stringify({ key, generated_at }))
  return { key, generated_at }
}

/**
 * Constant-time-ish comparison — this is a shared secret guarding a
 * public ingestion endpoint, not a high-value cryptographic key, but a
 * naive `===` leaks timing information for free, so a simple fixed-time
 * XOR compare costs nothing to add.
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

/** No key configured for the organisation => every signal is rejected. Secure by default, never open. */
export async function verifySignalKey(env: Env, organisationId: string, providedKey: string | null): Promise<boolean> {
  if (!providedKey) return false
  const stored = await readStored(env, organisationId)
  if (!stored) return false
  return timingSafeEqual(stored.key, providedKey)
}
