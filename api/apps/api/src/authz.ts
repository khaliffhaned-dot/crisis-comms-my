import { resolveIdentity, ForbiddenError, type Env, type QuorumRole } from '@escalate-my/shared'
import { memberRepo } from '@escalate-my/incidents'

/**
 * Every role a member can hold (packages/incidents/src/members.ts) besides
 * 'Admin', which `checkRole` already passes unconditionally. Used by
 * `requireOrgAccess`'s default so "just needs to belong to this
 * organisation, any role" doesn't accidentally mean "Admin only" — an
 * empty `allowedRoles` array passed to `checkRole` means exactly that
 * (`allowedRoles.includes(role)` is never true for `[]`), which is the
 * correct, narrower semantic for the Admin-gated routes that call
 * `checkRole` directly (member management, org settings, signal-key
 * rotate) but was the wrong default here: viewing or acting on your own
 * organisation's incidents must not require being an Admin.
 */
const ANY_MEMBER_ROLES: Array<QuorumRole | 'Observer'> = [
  'Legal',
  'Corporate Affairs',
  'Operations',
  'Compliance',
  'Company Secretary',
  'Crisis Lead',
  'CEO',
  'Observer',
]

/**
 * Fires once per Worker isolate the first time the fail-open path is hit —
 * not once per request, which would flood Workers Logs under real traffic.
 * `enforced: false` is a legitimate, documented rollout state (see
 * RoleCheckResult below), not a bug on its own; the problem is it was
 * previously silent. This makes it observable in `wrangler tail` /
 * Workers Logs without changing the actual (unchanged, intentionally
 * additive) behaviour.
 */
let warnedFailOpen = false

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
    if (!warnedFailOpen) {
      warnedFailOpen = true
      console.warn(
        '[authz] RBAC not enforced: Cloudflare Access is not verifying callers on this route. ' +
          'Every org-scoped request is currently allowed through unchecked. Enable Access on this ' +
          "Worker's route to start enforcing — see api/infrastructure/wrangler/wrangler.jsonc's access block."
      )
    }
    return { enforced: false, allowed: true, role: null, actor: identity.actor }
  }

  const members = memberRepo(env)
  const memberCount = await members.count(organisationId)
  if (memberCount === 0) {
    if (!warnedFailOpen) {
      warnedFailOpen = true
      console.warn(
        `[authz] RBAC not enforced for organisation ${organisationId}: no members configured yet ` +
          '(POST /api/v1/organisations/:id/members to add the first one). Every request for this ' +
          'organisation is currently allowed through unchecked.'
      )
    }
    return { enforced: false, allowed: true, role: null, actor: identity.actor }
  }

  const role = await members.getRole(organisationId, identity.email)
  const allowed = role === 'Admin' || (role !== null && allowedRoles.includes(role))
  return { enforced: true, allowed, role, actor: identity.actor }
}

/**
 * The guard every incident/signal-scoped route should use: resolves the
 * caller's access to `organisationId` and throws ForbiddenError (caught by
 * app.onError -> 403) if an enforced check denies them. The default
 * `allowedRoles` (every role but Admin — Admin already always passes) means
 * "any member of this organisation" — the right bar for viewing or acting
 * on your own org's incidents, distinct from the Admin-only bar that
 * member-management/org-settings/signal-key-rotate correctly use via
 * `checkRole` directly with an explicit `[]`. Pass a narrower list (e.g.
 * `[role]` for the quorum vote route) when the action itself should be
 * restricted to specific roles, not just "any member."
 *
 * Previously, most incident/signal routes fetched the resource (for its
 * organisation_id, to stamp the audit log) but never called checkRole at
 * all — so even once Access + org membership are configured, those routes
 * would stay open to any verified member of ANY organisation, not just
 * this one. This closes that gap without changing the already-documented,
 * intentional fail-open behaviour while Access/membership aren't set up.
 */
export async function requireOrgAccess(
  env: Env,
  executionCtx: unknown,
  organisationId: string,
  allowedRoles: string[] = ANY_MEMBER_ROLES
): Promise<RoleCheckResult> {
  const result = await checkRole(env, executionCtx, organisationId, allowedRoles)
  if (result.enforced && !result.allowed) {
    throw new ForbiddenError()
  }
  return result
}
