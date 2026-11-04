import { resolveIdentity, type Env } from '@escalate-my/shared'
import { memberRepo } from '@escalate-my/incidents'

export interface RoleCheckResult {
  /**
   * True once RBAC is actually active for this organisation — both the
   * caller's identity is Cloudflare Access-verified AND the organisation
   * has at least one member configured in `users`. False means "not
   * enforced yet" (identity unverified, or nobody has been added as a
   * member for this org), not "denied" — every route stays exactly as
   * permissive as it was before RBAC existed until both conditions hold,
   * the same additive, never-breaks-what-exists pattern as every other
   * gated feature in this API (resolveIdentity, Workers AI drafting).
   */
  enforced: boolean
  /** Always true when `enforced` is false. */
  allowed: boolean
  /** The caller's assigned role for this organisation, or null if none. */
  role: string | null
  /** The verified actor name/email, or whatever resolveIdentity returns unverified. */
  actor: string | null
}

/**
 * Checks whether the caller holds one of `allowedRoles` — or 'Admin',
 * which always passes any check — for `organisationId`. See
 * `RoleCheckResult.enforced` for when this is actually binding.
 */
export async function checkRole(
  env: Env,
  executionCtx: unknown,
  organisationId: string,
  allowedRoles: string[]
): Promise<RoleCheckResult> {
  const identity = await resolveIdentity(executionCtx)
  if (!identity.verified || !identity.email) {
    return { enforced: false, allowed: true, role: null, actor: identity.actor }
  }

  const members = memberRepo(env)
  const memberCount = await members.count(organisationId)
  if (memberCount === 0) {
    return { enforced: false, allowed: true, role: null, actor: identity.actor }
  }

  const role = await members.getRole(organisationId, identity.email)
  const allowed = role === 'Admin' || (role !== null && allowedRoles.includes(role))
  return { enforced: true, allowed, role, actor: identity.actor }
}
