import {
  recommendSeverity,
  SEVERITY,
  type Env,
  type SeverityInput,
} from '@escalate-my/shared'
import { first60Checklist } from './first60'
import { draftHoldingStatement, type DraftHoldingStatementInput } from './holding'
import {
  listApprovedResponseTypes,
  renderApprovedResponse,
  isoDateOnly,
  type ApprovedResponseType,
  type ApprovedResponseFields,
  type Audience,
} from './approvedResponses'
import { incidentRepo } from './repository'

export class IncidentService {
  constructor(private env: Env) {}

  private repo() {
    return incidentRepo(this.env)
  }

  listActive(organisationId: string) {
    return this.repo().listActive(organisationId)
  }

  get(id: string) {
    return this.repo().get(id)
  }

  async create(input: {
    organisation_id: string
    title: string
    scenario?: string
    owner?: string
    actor?: string
    app_version?: string
  }) {
    const inc = await this.repo().create({
      organisation_id: input.organisation_id,
      title: input.title,
      scenario: input.scenario,
      owner: input.owner,
      created_by: input.actor,
    })
    await this.repo().seedFirst60Tasks(inc.id, inc.created_at)
    await this.repo().writeAudit({
      organisation_id: input.organisation_id,
      incident_id: inc.id,
      actor: input.actor || 'system',
      action: 'incident.created',
      detail: input.app_version ? `${input.title} · build ${input.app_version}` : input.title,
    })
    return inc
  }

  async close(id: string, actor = 'system') {
    const inc = await this.repo().close(id)
    await this.repo().writeAudit({
      organisation_id: inc.organisation_id,
      incident_id: inc.id,
      actor,
      action: 'incident.closed',
    })
    return inc
  }

  recommend(input: SeverityInput) {
    const level = recommendSeverity(input)
    return { level, profile: SEVERITY[level] }
  }

  first60() {
    return first60Checklist()
  }

  tasks(incidentId: string) {
    return this.repo().listTasks(incidentId)
  }

  holding(opts: DraftHoldingStatementInput) {
    return draftHoldingStatement(this.env, opts)
  }

  approvedResponseTypes(audience?: Audience) {
    return listApprovedResponseTypes(audience)
  }

  /**
   * Approved Responses™ — deterministic, pre-vetted statement fill, never
   * AI-touched (see approvedResponses.ts header). Pulls the incident's real
   * title/date, and for the Crisis Update template derives up to 3 action
   * bullets from the most recently completed First 60 Minutes tasks instead
   * of inventing them — any slot without a real completed task keeps its
   * literal [ACTION n] / [TINDAKAN n] placeholder.
   */
  async approvedResponse(opts: {
    incidentId: string
    type: ApprovedResponseType
    lang: 'en' | 'bm' | 'both'
    company: string
    productName?: string
  }) {
    const incident = await this.repo().get(opts.incidentId)
    const tasks = await this.repo().listTasks(opts.incidentId)
    const actions = tasks
      .filter((t) => t.status === 'done' && !!t.completed_at)
      .sort((a, b) => (b.completed_at! > a.completed_at! ? 1 : -1))
      .slice(0, 3)
      .map((t) => t.title) as [string?, string?, string?]

    const fields: ApprovedResponseFields = {
      organisationName: opts.company,
      incidentSummary: incident.title,
      date: isoDateOnly(incident.created_at),
      productName: opts.productName,
      actions,
    }
    return renderApprovedResponse(opts.type, opts.lang, fields)
  }
}
