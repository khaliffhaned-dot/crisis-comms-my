# Escalate MY — live collaboration (IncidentRoom Durable Object)

> Superseded design, kept for history: this used to be a **separate**
> Worker (`escalate-my-war-room`) with its own Durable Object holding an
> independent copy of severity/checklist/clocks/log/statement — a second,
> disconnected source of truth from D1. That worker, its `wrangler.worker.toml`,
> and the client hook that spoke its protocol (`src/hooks/useWarRoom.ts`,
> which was never actually wired into any screen) are gone. What's below
> describes the current design.

D1 (via `escalate-my-api`) is the **only** store for incident data —
severity, tasks, quorum votes, regulatory clocks, the statement, the audit
trail. `IncidentRoom` is a Durable Object **inside that same Worker** that
holds nothing but who's currently connected to an incident ("presence")
and relays a tiny "something changed, go refetch" push after every write —
see `api/apps/api/src/incidentRoom.ts` for the full reasoning.

## Architecture

```
Browser  --WSS-->  escalate-my-api Worker  --(same env binding)-->  IncidentRoom DO
                          |                                          (one per incident id,
                          v                                           presence + broadcast only)
                         D1  <---- every mutation route writes here first,
                                   then pokes the DO (fire-and-forget)
```

## WebSocket endpoint

```
wss://escalate-my-api.<subdomain>.workers.dev/api/v1/incidents/<incidentId>/live?name=<operator>
```

## Message protocol (JSON)

**Client → server**

| type  | fields |
|-------|--------|
| hello | name   |
| ping  |        |

**Server → client**

| type             | fields                    |
|------------------|----------------------------|
| presence         | presence[] (id, name, joinedAt) |
| incident_updated | incidentId, reason        |
| pong             | t                          |
| error            | message                    |

A client does **not** mutate incident data over this socket. On
`incident_updated`, re-fetch `GET /api/v1/incidents/:id/full` (or just the
piece that matters) the same way the app already does after its own
writes — the push only tells you *when*, not *what*.

## Cost note

Durable Objects require **Workers Paid** ($5/mo minimum). Hibernation
keeps idle rooms cheap — one instance per incident, not per connection.
