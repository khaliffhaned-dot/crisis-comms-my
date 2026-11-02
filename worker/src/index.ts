/**
 * Escalate MY — Incident war room
 * One Durable Object per client/incident id.
 * Shared: severity, first-60 checks, clocks, decision log, presence.
 */
import { DurableObject } from 'cloudflare:workers'

export interface Env {
  INCIDENT_ROOM: DurableObjectNamespace
}

export type Severity = 1 | 2 | 3 | 4 | null

export interface RoomState {
  roomId: string
  severity: Severity
  checked: boolean[]
  clocks: Record<string, boolean>
  log: Array<{ id: number; time: string; text: string; by?: string }>
  statement: string
  scenario: string
  presence: Array<{ id: string; name: string; joinedAt: number }>
  updatedAt: number
}

type ClientMsg =
  | { type: 'hello'; name?: string }
  | { type: 'setSeverity'; severity: Severity; by?: string }
  | { type: 'toggleCheck'; index: number; value?: boolean; by?: string }
  | { type: 'setChecked'; checked: boolean[]; by?: string }
  | { type: 'toggleClock'; id: string; value?: boolean; by?: string }
  | { type: 'addLog'; text: string; by?: string }
  | { type: 'setStatement'; statement: string; scenario?: string; by?: string }
  | { type: 'ping' }

type ServerMsg =
  | { type: 'state'; state: RoomState }
  | { type: 'presence'; presence: RoomState['presence'] }
  | { type: 'pong'; t: number }
  | { type: 'error'; message: string }

const DEFAULT_CHECKED_LEN = 13

function emptyState(roomId: string): RoomState {
  return {
    roomId,
    severity: null,
    checked: Array(DEFAULT_CHECKED_LEN).fill(false),
    clocks: {},
    log: [],
    statement: '',
    scenario: 'operational',
    presence: [],
    updatedAt: Date.now(),
  }
}

export class IncidentRoom extends DurableObject {
  private state: RoomState
  private sessions = new Map<WebSocket, { id: string; name: string }>()

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    this.state = emptyState('pending')
    // Restore from storage on wake
    this.ctx.blockConcurrencyWhile(async () => {
      const stored = await this.ctx.storage.get<RoomState>('room')
      if (stored) this.state = stored
    })
  }

  private async persist() {
    this.state.updatedAt = Date.now()
    await this.ctx.storage.put('room', this.state)
  }

  private broadcast(msg: ServerMsg, except?: WebSocket) {
    const data = JSON.stringify(msg)
    for (const ws of this.ctx.getWebSockets()) {
      if (except && ws === except) continue
      try {
        ws.send(data)
      } catch {
        /* ignore dead sockets */
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

  private rebuildPresence() {
    this.state.presence = Array.from(this.sessions.values()).map((s) => ({
      id: s.id,
      name: s.name,
      joinedAt: Date.now(),
    }))
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    // REST snapshot (optional)
    if (request.method === 'GET' && url.pathname.endsWith('/state')) {
      return Response.json(this.state)
    }

    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket upgrade. Use /ws?room=<id>', { status: 426 })
    }

    const pair = new WebSocketPair()
    const [client, server] = Object.values(pair)
    this.ctx.acceptWebSocket(server)

    const name = url.searchParams.get('name') || 'Operator'
    const id = crypto.randomUUID().slice(0, 8)
    this.sessions.set(server, { id, name })
    this.rebuildPresence()

    // Ensure room id
    if (this.state.roomId === 'pending') {
      this.state.roomId = url.searchParams.get('room') || 'default'
      await this.persist()
    }

    this.send(server, { type: 'state', state: this.state })
    this.broadcast({ type: 'presence', presence: this.state.presence })

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
    const by = session?.name

    switch (msg.type) {
      case 'hello': {
        if (session && msg.name) {
          session.name = msg.name.slice(0, 40)
          this.sessions.set(ws, session)
          this.rebuildPresence()
          this.broadcast({ type: 'presence', presence: this.state.presence })
        }
        this.send(ws, { type: 'state', state: this.state })
        break
      }
      case 'setSeverity': {
        this.state.severity = msg.severity
        const label = msg.severity == null ? 'cleared' : `L${msg.severity}`
        this.state.log.unshift({
          id: Date.now(),
          time: new Date().toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          text: `Severity → ${label}`,
          by: msg.by || by,
        })
        this.state.log = this.state.log.slice(0, 200)
        await this.persist()
        this.broadcast({ type: 'state', state: this.state })
        break
      }
      case 'toggleCheck': {
        const i = msg.index
        if (i < 0 || i >= this.state.checked.length) break
        this.state.checked[i] = msg.value ?? !this.state.checked[i]
        await this.persist()
        this.broadcast({ type: 'state', state: this.state })
        break
      }
      case 'setChecked': {
        if (Array.isArray(msg.checked)) {
          this.state.checked = msg.checked.map(Boolean)
          await this.persist()
          this.broadcast({ type: 'state', state: this.state })
        }
        break
      }
      case 'toggleClock': {
        const on = msg.value ?? !this.state.clocks[msg.id]
        this.state.clocks = { ...this.state.clocks, [msg.id]: on }
        this.state.log.unshift({
          id: Date.now(),
          time: new Date().toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          text: on ? `Clock started: ${msg.id}` : `Clock stopped: ${msg.id}`,
          by: msg.by || by,
        })
        this.state.log = this.state.log.slice(0, 200)
        await this.persist()
        this.broadcast({ type: 'state', state: this.state })
        break
      }
      case 'addLog': {
        const text = (msg.text || '').trim().slice(0, 500)
        if (!text) break
        this.state.log.unshift({
          id: Date.now(),
          time: new Date().toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          text,
          by: msg.by || by,
        })
        this.state.log = this.state.log.slice(0, 200)
        await this.persist()
        this.broadcast({ type: 'state', state: this.state })
        break
      }
      case 'setStatement': {
        this.state.statement = msg.statement || ''
        if (msg.scenario) this.state.scenario = msg.scenario
        await this.persist()
        this.broadcast({ type: 'state', state: this.state })
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
    this.rebuildPresence()
    this.broadcast({ type: 'presence', presence: this.state.presence })
    try {
      ws.close(1000, 'closed')
    } catch {
      /* ignore */
    }
  }

  async webSocketError(ws: WebSocket) {
    this.sessions.delete(ws)
    this.rebuildPresence()
    this.broadcast({ type: 'presence', presence: this.state.presence })
  }
}

/** Worker: route /ws?room=ID to the matching IncidentRoom */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // CORS for SPA on pages.dev / netlify / localhost
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders(request),
      })
    }

    if (url.pathname === '/health') {
      return new Response('ok', { headers: corsHeaders(request) })
    }

    if (url.pathname === '/ws' || url.pathname.endsWith('/ws')) {
      const room = url.searchParams.get('room') || 'demo-main'
      const id = env.INCIDENT_ROOM.idFromName(room)
      const stub = env.INCIDENT_ROOM.get(id)
      return stub.fetch(request)
    }

    if (url.pathname === '/state' || url.pathname.endsWith('/state')) {
      const room = url.searchParams.get('room') || 'demo-main'
      const id = env.INCIDENT_ROOM.idFromName(room)
      const stub = env.INCIDENT_ROOM.get(id)
      const res = await stub.fetch(new Request(new URL('/state', request.url), request))
      const body = await res.text()
      return new Response(body, {
        status: res.status,
        headers: { ...corsHeaders(request), 'Content-Type': 'application/json' },
      })
    }

    return new Response(
      JSON.stringify({
        service: 'escalate-my-war-room',
        endpoints: ['/ws?room=<clientId>&name=<operator>', '/state?room=<clientId>', '/health'],
      }),
      { headers: { ...corsHeaders(request), 'Content-Type': 'application/json' } }
    )
  },
}

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin') || '*'
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Credentials': 'true',
  }
}
