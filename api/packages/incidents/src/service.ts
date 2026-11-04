import {
  recommendSeverity,
  SEVERITY,
  type Env,
  type SeverityInput,
} from '@escalate-my/shared'
import { first60Checklist } from './first60'
import { createHoldingStatement } from './holding'
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
      detail: input.title,
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

  holding(opts: Parameters<typeof createHoldingStatement>[0]) {
    return createHoldingStatement(opts)
  }
}
