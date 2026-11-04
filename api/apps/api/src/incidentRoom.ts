import { DurableObject } from 'cloudflare:workers'

/**
 * IncidentRoom — presence + broadcast relay for one incident, nothing more.
 *
 * D1 is the authoritative store for every incident field (see
 * repository.ts) — this Durable Object never holds its own copy of
 * severity/tasks/quorum/clocks/statement. Its only state is who is
 * currently connected to this incident ("presence"). When the REST API
 * writes a change to D1, it pokes this DO (best-effort, fire-and-forget —
 * see broadcastIncidentUpdate in index.ts) and the DO relays a tiny
 * "something changed, refetch" message to every connected client. Clients
 * still read the real data from GET /api/v1/incidents/:id/full, same as
 * before; this just tells them WHEN to do that instead of polling.
 *
 * This replaces an earlier version of this class that held its own
 * RoomState (severity, a 13-item checklist, clocks, a decision log,
 * a free-text statement) as a second, independent source of truth,
 * disconnected from D1. That version is why this file exists at all —
 * "bridge the Durable Object with D1" means collapsing to one source of
 * truth, not synchronizing two.
 */

interface PresenceEntry {
  id: string
  name: string
  joinedAt: number
}

type ClientMsg = { type: 'hello'; name?: string } | { type: 'ping' }

type ServerMsg =
  | { type: 'presence'; presence: PresenceEntry[] }
  | { type: 'incident_updated'; incidentId: string; reason: string }
  | { type: 'pong'; t: number }
  | { type: 'error'; message: string }

export class IncidentRoom extends DurableObject {
  private sessions = new Map<WebSocket, PresenceEntry>()

  private broadcast(msg: ServerMsg, except?: WebSocket) {
    const data = JSON.stringify(msg)
    for (const ws of this.ctx.getWebSockets()) {
      if (except && ws === except) continue
      try {
        ws.send(data)
      } catch {
        /* dead socket, webSocketClose will clean it up */
      }
    }
  }

  private send(ws: WebSocket, msg: ServerMsg) {
    try {
      ws.send(JSON.stringify(msg))
    } catch {
      /* ignore */
    }
  }

  private currentPresence(): PresenceEntry[] {
    return Array.from(this.sessions.values())
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    // Internal: the REST API calls this right after a successful D1 write.
    // Never exposed outside the Worker's own env binding — there is no
    // public route that reaches this path directly.
    if (request.method === 'POST' && url.pathname === '/broadcast') {
      const body = await request.json<{ incidentId: string; reason?: string }>().catch(() => null)
      if (!body?.incidentId) return new Response('incidentId required', { status: 400 })
      this.broadcast({ type: 'incident_updated', incidentId: body.incidentId, reason: body.reason ?? 'updated' })
      return new Response(null, { status: 204 })
    }

    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket upgrade. Use /ws?room=<incidentId>&name=<operator>', { status: 426 })
    }

    const pair = new WebSocketPair()
    const [client, server] = Object.values(pair)
    this.ctx.acceptWebSocket(server)

    const name = (url.searchParams.get('name') || 'Operator').slice(0, 40)
    const id = crypto.randomUUID().slice(0, 8)
    this.sessions.set(server, { id, name, joinedAt: Date.now() })

    this.send(server, { type: 'presence', presence: this.currentPresence() })
    this.broadcast({ type: 'presence', presence: this.currentPresence() }, server)

    return new Response(null, { status: 101, webSocket: client })
  }

  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    let msg: ClientMsg
    try {
      msg = JSON.parse(typeof message === 'string' ? message : new TextDecoder().decode(message))
    } catch {
      this.send(ws, { type: 'error', message: 'Invalid JSON' })
      return
    }

    const session = this.sessions.get(ws)
    switch (msg.type) {
      case 'hello': {
        if (session && msg.name) {
          session.name = msg.name.slice(0, 40)
          this.sessions.set(ws, session)
          this.broadcast({ type: 'presence', presence: this.currentPresence() })
        }
        break
      }
      case 'ping': {
        this.send(ws, { type: 'pong', t: Date.now() })
        break
      }
      default:
        this.send(ws, { type: 'error', message: 'Unknown message type' })
    }
  }

  async webSocketClose(ws: WebSocket) {
    this.sessions.delete(ws)
    this.broadcast({ type: 'presence', presence: this.currentPresence() })
  }

  async webSocketError(ws: WebSocket) {
    this.sessions.delete(ws)
    this.broadcast({ type: 'presence', presence: this.currentPresence() })
  }
}
