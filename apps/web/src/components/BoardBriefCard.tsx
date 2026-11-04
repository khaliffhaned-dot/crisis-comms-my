import { useState } from 'react'
import { FileDown, Loader2, Users2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { generateBoardBrief } from '@/lib/api'
import { severityMeta } from '@/lib/format'
import type { ApiQuorumRow, ApiTask, FullIncidentPayload } from '@/lib/types'

function impactLine(payload: FullIncidentPayload): string {
  const meta = severityMeta(payload.incident.severity)
  if (!meta) return 'Severity not yet assessed.'
  if (meta.level <= 2) return `Low operational impact (L${meta.level} ${meta.name}).`
  if (meta.level === 3) return `Moderate reputational exposure (L3 ${meta.name}) — regulatory disclosure likely required.`
  return `High impact (L4 ${meta.name}) — board and regulatory escalation active.`
}

function actionsTaken(tasks: ApiTask[]): ApiTask[] {
  return tasks.filter((t) => t.status === 'done').sort((a, b) => (a.step_index ?? 0) - (b.step_index ?? 0))
}

function outstanding(quorum: ApiQuorumRow[]): ApiQuorumRow[] {
  return quorum.filter((q) => q.state === 'pending')
}

/**
 * The live, structured BoardBrief view — Situation / Impact / Actions Taken
 * / Outstanding Decisions, each pulled from the same real incident+tasks+
 * quorum data the other two screens show (not a separate invented schema).
 * The action buttons call the real POST /api/v1/reports/board-brief route,
 * which generates and stores an actual markdown report in R2 — "Generate
 * PDF" uses the browser's native print-to-PDF (window.print(), styled by
 * the @media print rule in index.css) against that same content, a real
 * export rather than a stub.
 */
export function BoardBriefCard({ payload, incidentId }: { payload: FullIncidentPayload; incidentId: string }) {
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const done = actionsTaken(payload.tasks)
  const pendingVotes = outstanding(payload.quorum)

  async function handleGenerate(kind: 'situation_report' | 'ceo_brief' | 'board_update') {
    setPending(kind)
    setError(null)
    try {
      await generateBoardBrief(incidentId, kind)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate the brief.')
    } finally {
      setPending(null)
    }
  }

  function handlePrint() {
    window.print()
  }

  return (
    <Card data-print-root>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">
          BoardBrief<span className="text-muted-foreground align-super text-[10px]">™</span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-1.5">
        <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Situation</h3>
        <p className="text-sm leading-relaxed">{payload.incident.statement || payload.incident.title}</p>
      </CardContent>

      <Separator />

      <CardContent className="flex flex-col gap-1.5">
        <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Impact</h3>
        <p className="text-sm leading-relaxed">{impactLine(payload)}</p>
      </CardContent>

      <Separator />

      <CardContent className="flex flex-col gap-1.5">
        <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Actions Taken</h3>
        {done.length === 0 ? (
          <p className="text-muted-foreground text-sm">No steps completed yet.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {done.map((task) => (
              <li key={task.id} className="flex items-center gap-2 text-sm">
                <span className="text-success" aria-hidden="true">
                  ✓
                </span>
                {task.title}
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <Separator />

      <CardContent className="flex flex-col gap-1.5">
        <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">Outstanding Decisions</h3>
        {pendingVotes.length === 0 ? (
          <p className="text-muted-foreground text-sm">Quorum fully resolved.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {pendingVotes.map((vote) => (
              <li key={vote.role} className="flex items-center gap-2 text-sm">
                <Users2 className="text-muted-foreground size-3.5" aria-hidden="true" />
                {vote.role} review
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      {error && (
        <CardContent>
          <p className="text-destructive text-sm">{error}</p>
        </CardContent>
      )}

      <CardFooter className="flex flex-wrap gap-2 border-t pt-5 print:hidden">
        <Button onClick={handlePrint} className="gap-1.5">
          <FileDown className="size-4" aria-hidden="true" />
          Generate PDF
        </Button>
        <Button
          variant="outline"
          disabled={pending !== null}
          onClick={() => handleGenerate('ceo_brief')}
        >
          {pending === 'ceo_brief' && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          CEO Brief
        </Button>
        <Button
          variant="outline"
          disabled={pending !== null}
          onClick={() => handleGenerate('board_update')}
        >
          {pending === 'board_update' && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          Board Update
        </Button>
      </CardFooter>
    </Card>
  )
}
