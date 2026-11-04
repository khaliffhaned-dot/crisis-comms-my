/**
 * Cloudflare Access identity resolution.
 *
 * When Cloudflare Access is enabled in front of this Worker's route, every
 * request carries a verified identity on the native `ExecutionContext` —
 * `ctx.access.getIdentity()` — with no JWT parsing needed on our side
 * (Access already validated the `Cf-Access-Jwt-Assertion` header before the
 * request reached us). See https://developers.cloudflare.com/cloudflare-one/.
 *
 * This resolves gracefully: if Access is not enabled on the route (e.g.
 * local `wrangler dev` without an `access.dev` block, or the dashboard
 * toggle not flipped yet), `ctx.access` is `undefined` and callers fall
 * back to whatever actor the client supplied — today's behaviour,
 * unchanged. The moment Access is turned on, every write starts recording
 * a real, unspoofable name instead.
 */
export interface ResolvedIdentity {
  /** Verified display name/email from Access, or null if unverified. */
  actor: string | null
  /** True only when `actor` came from a Cloudflare Access-verified identity. */
  verified: boolean
  /** The verified email, when Access provided one. */
  email: string | null
}

interface AccessIdentityLike {
  email?: string
  name?: string
}

const UNVERIFIED: ResolvedIdentity = { actor: null, verified: false, email: null }

/**
 * Takes `unknown` deliberately: Hono types `c.executionCtx` with its own
 * minimal `ExecutionContext` (just `waitUntil`/`passThroughOnException`)
 * that doesn't declare `access`, even though the real Workers runtime
 * object it wraps does carry it once Cloudflare Access is enabled. Typing
 * the parameter against either `ExecutionContext` shape would force a cast
 * at every call site; checking defensively at runtime here does the same
 * job without one.
 */

export async function resolveIdentity(executionCtx: unknown): Promise<ResolvedIdentity> {
  try {
    const access = (executionCtx as { access?: { getIdentity?: () => Promise<AccessIdentityLike | undefined> } })
      ?.access
    const identity = await access?.getIdentity?.()
    if (!identity) return UNVERIFIED
    const actor = identity.name || identity.email || null
    return { actor, verified: true, email: identity.email ?? null }
  } catch {
    // Access misconfigured or getIdentity() failed — never block the request on this.
    return UNVERIFIED
  }
}
