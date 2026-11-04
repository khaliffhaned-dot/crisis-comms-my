import { id, nowIso, type Env } from '@escalate-my/shared'

/**
 * Backs onto the `users` table — present in the D1 schema since migration
 * 0001 but, until now, never read or written by any route: a pre-built,
 * disconnected foundation for per-organisation role assignment, the same
 * pattern this codebase has had before (the IncidentRoom Durable Object
 * sat unconnected the same way until the real-time collaboration work).
 *
 * Roles are free-text, matching the existing QuorumRole vocabulary
 * ('CEO' | 'Legal' | 'Corporate Affairs' | 'Operations' | 'Compliance' |
 * 'Company Secretary' | 'Crisis Lead') plus two added here for the
 * permission system specifically: 'Admin' (manages membership, always
 * passes any role check) and 'Observer' (explicit read-only — distinct
 * from "no role assigned", which is what every identity has before RBAC
 * is turned on for an organisation).
 */
export interface OrganisationMember {
  id: string
  organisation_id: string
  email: string
  name: string
  role: string
  created_at: string
}

export class MemberRepository {
  constructor(private db: D1Database) {}

  async list(organisationId: string): Promise<OrganisationMember[]> {
    const res = await this.db
      .prepare(`SELECT * FROM users WHERE organisation_id = ? ORDER BY created_at ASC`)
      .bind(organisationId)
      .all<OrganisationMember>()
    return res.results ?? []
  }

  async count(organisationId: string): Promise<number> {
    const row = await this.db
      .prepare(`SELECT COUNT(*) as n FROM users WHERE organisation_id = ?`)
      .bind(organisationId)
      .first<{ n: number }>()
    return row?.n ?? 0
  }

  async getRole(organisationId: string, email: string): Promise<string | null> {
    const row = await this.db
      .prepare(`SELECT role FROM users WHERE organisation_id = ? AND email = ?`)
      .bind(organisationId, email.toLowerCase())
      .first<{ role: string }>()
    return row?.role ?? null
  }

  async upsert(organisationId: string, email: string, name: string, role: string): Promise<OrganisationMember> {
    const normalizedEmail = email.toLowerCase()
    await this.db
      .prepare(
        `INSERT INTO users (id, organisation_id, email, name, role, created_at)
         VALUES (?, ?, ?, ?, ?, ?)
         ON CONFLICT(organisation_id, email) DO UPDATE SET name = excluded.name, role = excluded.role`
      )
      .bind(id('USR'), organisationId, normalizedEmail, name, role, nowIso())
      .run()
    const row = await this.db
      .prepare(`SELECT * FROM users WHERE organisation_id = ? AND email = ?`)
      .bind(organisationId, normalizedEmail)
      .first<OrganisationMember>()
    if (!row) throw new Error('Member upsert failed to read back the row it just wrote')
    return row
  }

  async remove(organisationId: string, email: string): Promise<void> {
    await this.db
      .prepare(`DELETE FROM users WHERE organisation_id = ? AND email = ?`)
      .bind(organisationId, email.toLowerCase())
      .run()
  }
}

export function memberRepo(env: Env) {
  return new MemberRepository(env.DB)
}
