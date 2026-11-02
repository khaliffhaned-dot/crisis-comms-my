/**
 * Client hook — connect Escalate MY UI to Cloudflare IncidentRoom DO.
 *
 * Usage:
 *   const { connected, presence, pushSeverity, pushCheck, pushClock, pushLog, pushStatement } =
 *     useWarRoom({
 *       roomId: client.id,
 *       name: 'Crisis Lead',
 *       wsBase: import.meta.env.VITE_WAR_ROOM_WS || 'wss://escalate-my-war-room.<account>.workers.dev',
 *       onState: (s) => { setSeverity(s.severity); setChecked(s.checked); ... }
 *     })
 */
import { useCallback, useEffect, useRef, useState } from 'react'

export interface WarRoomState {
  roomId: string
  severity: 1 | 2 | 3 | 4 | null
  checked: boolean[]
  clocks: Record<string, boolean>
  log: Array<{ id: number; time: string; text: string; by?: string }>
  statement: string
  scenario: string
  presence: Array<{ id: string; name: string; joinedAt: number }>
  updatedAt: number
}

export interface UseWarRoomOptions {
  roomId: string
  name?: string
  /** e.g. wss://escalate-my-war-room.xxx.workers.dev */
  wsBase: string
  enabled?: boolean
  onState?: (state: WarRoomState) => void
}

export function useWarRoom({
  roomId,
  name = 'Operator',
  wsBase,
  enabled = true,
  onState,
}: UseWarRoomOptions) {
  const [connected, setConnected] = useState(false)
  const [presence, setPresence] = useState<WarRoomState['presence']>([])
  const [lastState, setLastState] = useState<WarRoomState | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const onStateRef = useRef(onState)
  onStateRef.current = onState
  const reconnectRef = useRef(0)

  const send = useCallback((msg: object) => {
    const ws = wsRef.current
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(msg))
    }
  }, [])

  useEffect(() => {
    if (!enabled || !wsBase || !roomId) return

    let closed = false
    let timer: number | undefined

    const connect = () => {
      if (closed) return
      const url = `${wsBase.replace(/\/$/, '')}/ws?room=${encodeURIComponent(roomId)}&name=${encodeURIComponent(name)}`
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setConnected(true)
        reconnectRef.current = 0
        ws.send(JSON.stringify({ type: 'hello', name }))
      }

      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data)
          if (msg.type === 'state' && msg.state) {
            setLastState(msg.state)
            setPresence(msg.state.presence || [])
            onStateRef.current?.(msg.state)
          } else if (msg.type === 'presence') {
            setPresence(msg.presence || [])
          }
        } catch {
          /* ignore */
        }
      }

      ws.onclose = () => {
        setConnected(false)
        wsRef.current = null
        if (closed) return
        const delay = Math.min(10_000, 500 * 2 ** reconnectRef.current++)
        timer = window.setTimeout(connect, delay)
      }

      ws.onerror = () => {
        try {
          ws.close()
        } catch {
          /* ignore */
        }
      }
    }

    connect()

    const ping = window.setInterval(() => {
      send({ type: 'ping' })
    }, 25_000)

    return () => {
      closed = true
      window.clearInterval(ping)
      if (timer) window.clearTimeout(timer)
      try {
        wsRef.current?.close()
      } catch {
        /* ignore */
      }
    }
  }, [enabled, wsBase, roomId, name, send])

  return {
    connected,
    presence,
    lastState,
    pushSeverity: (severity: WarRoomState['severity'], by?: string) =>
      send({ type: 'setSeverity', severity, by }),
    pushCheck: (index: number, value?: boolean, by?: string) =>
      send({ type: 'toggleCheck', index, value, by }),
    pushChecked: (checked: boolean[], by?: string) =>
      send({ type: 'setChecked', checked, by }),
    pushClock: (id: string, value?: boolean, by?: string) =>
      send({ type: 'toggleClock', id, value, by }),
    pushLog: (text: string, by?: string) => send({ type: 'addLog', text, by }),
    pushStatement: (statement: string, scenario?: string, by?: string) =>
      send({ type: 'setStatement', statement, scenario, by }),
  }
}
