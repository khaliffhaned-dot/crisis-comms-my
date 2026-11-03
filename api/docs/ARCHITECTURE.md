# Architecture

## Product

Escalate MY™ — Crisis Intelligence Platform for Malaysian Organisations  
(BM category TBD in product UI; EN category locked when Decision / Regulatory / Board Intelligence ship.)

## Data flow

```text
MCP / Web → Workers (Hono) → D1
                          → KV (config)
                          → R2 (BoardBrief)
                          → Workers AI (Decision / Board Intelligence)
```

## Intelligence path

```text
Incident → Risk assessment → Decision support
        → Recommended actions → Board brief / insights
```

## API

`/api/v1/incidents` · `/tasks` · `/quorum` · `/regulatory` · `/reports` · `/holding-statements` · `/audit`

Future: `/api/v1/intelligence/assess` · `/api/v1/intelligence/obligations` · `/api/v1/intelligence/board`

## Non-goals

Social listening · media monitoring as product core
