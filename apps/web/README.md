# Escalate MY — sales prototype

Three screens, not the whole platform: **Crisis Command Centre**, **Incident
Detail**, and **BoardBrief**. The idea (per the product brief this was built
from): enterprise buyers decide after seeing three screens, not twenty — a
CEO opens the app and understands the situation, and what decision is
required next, in about ten seconds.

This is a separate app from the root `src/` frontend, not a replacement for
it. It reads real, live data from the same `escalate-my-api` Worker the rest
of the product uses (no mock/sample incidents) and talks to the same D1
tables (`incidents`, `tasks`, `quorum_responses`, `incident_obligations`,
`audit_log`). Its own design system (shadcn/ui, New York style, neutral +
semantic-status accent colors) is independent of the root app's
`.ux-profile.md` — see the PR description for why.

## Stack

- Vite + React 19 + TypeScript
- Tailwind CSS v4 (`@tailwindcss/vite`)
- shadcn/ui primitives (hand-placed under `src/components/ui/`, not pulled
  via the `shadcn` CLI): Card, Button, Badge, Progress, Tabs, Sheet, Drawer,
  Separator, ScrollArea
- `lucide-react` for icons, `react-router-dom` for the 3 routes

## Structure

```
src/
  pages/            CommandCentre.tsx, IncidentDetails.tsx, BoardBrief.tsx
  components/        ReadinessCard, SeverityBadge, QuorumCard,
                     RegulatoryClock, IncidentTimeline, ChecklistProgress,
                     BoardBriefCard, AppShell (5-tab nav), StateView
  components/ui/     the 9 shadcn primitives
  lib/               api.ts (escalate-my-api client), types.ts, format.ts,
                     uiClocks.ts, useIncident.ts
```

## Running it locally

Point at a real backend — either the deployed Worker (default) or a local
`wrangler dev` instance for development without touching shared data:

```bash
# .env.local (gitignored)
VITE_API_BASE=http://localhost:8799
```

```bash
npm install
npm run dev
```

## Navigation

Exactly 5 tabs, per the brief: Home, Incidents, Actions, Regulatory, More.
"Actions" and "Regulatory" deep-link into `IncidentDetails`' own sections
(`#actions` / `#regulatory`) rather than being separate pages — this is 3
screens, not 5.
