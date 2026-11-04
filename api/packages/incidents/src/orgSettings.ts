import type { Env } from '@escalate-my/shared'

/**
 * Backs onto the `CONFIG` KV namespace — declared in wrangler.jsonc and
 * provisioned in the account since early on, but never actually read or
 * written anywhere: another pre-bound, disconnected foundation, same shape
 * as the IncidentRoom Durable Object and the `users` table were before
 * they got wired up.
 *
 * Organisation settings are exactly the shape KV is for and D1 isn't:
 * read far more often than written (fetched on nearly every page load),
 * written rarely (an admin changes the org name once in a while), no
 * relational structure, fine with eventual consistency. Keeping this out
 * of D1's `incidents`/`tasks`/`quorum_responses`/`audit_log` tables keeps
 * those tables purely transactional incident data.
 *
 * Today this holds just what the Approved Responses / Holding Statement
 * builders need (organisation display name, default statement language)
 * instead of the frontend defaulting to a hardcoded placeholder name on
 * every session. Deliberately not a general-purpose settings bag — add
 * fields here only when something concrete needs them, same discipline
 * applied to the rest of this product's feature set.
 */
export interface OrganisationSettings {
  name: string
  default_statement_lang: 'en' | 'bm'
}

const DEFAULT_SETTINGS: OrganisationSettings = {
  name: 'Your Organisation',
  default_statement_lang: 'bm',
}

function kvKey(organisationId: string): string {
  return `org-settings:${organisationId}`
}

export async function getOrganisationSettings(env: Env, organisationId: string): Promise<OrganisationSettings> {
  const raw = await env.CONFIG.get(kvKey(organisationId))
  if (!raw) return DEFAULT_SETTINGS
  try {
    const parsed = JSON.parse(raw) as Partial<OrganisationSettings>
    return {
      name: typeof parsed.name === 'string' && parsed.name.trim() ? parsed.name : DEFAULT_SETTINGS.name,
      default_statement_lang: parsed.default_statement_lang === 'en' ? 'en' : 'bm',
    }
  } catch {
    // Corrupt/unexpected value in KV — never fail the request over it.
    return DEFAULT_SETTINGS
  }
}

export async function putOrganisationSettings(
  env: Env,
  organisationId: string,
  patch: Partial<OrganisationSettings>
): Promise<OrganisationSettings> {
  const current = await getOrganisationSettings(env, organisationId)
  const next: OrganisationSettings = {
    name: patch.name?.trim() || current.name,
    default_statement_lang: patch.default_statement_lang === 'en' || patch.default_statement_lang === 'bm'
      ? patch.default_statement_lang
      : current.default_statement_lang,
  }
  await env.CONFIG.put(kvKey(organisationId), JSON.stringify(next))
  return next
}
