# Escalate MY — Durable Object war room

Shared real-time state for severity, First 60 checklist, regulatory clocks, decision log, and operator presence.

## Architecture

```
Browser (Pages)  --WSS-->  Worker (escalate-my-war-room)
                              |
                              v
                     IncidentRoom Durable Object
                     (one instance per roomId = client id)
```

## Deploy Worker (requires Workers Paid for production DO)

```bash
npm i -D wrangler
npx wrangler login
npx wrangler deploy
```

Note the URL, e.g. `https://escalate-my-war-room.<subdomain>.workers.dev`

WebSocket endpoint:

```
wss://escalate-my-war-room.<subdomain>.workers.dev/ws?room=demo-main&name=Crisis%20Lead
```

## Wire the SPA

1. In Cloudflare Pages project → Settings → Environment variables:

   `VITE_WAR_ROOM_WS` = `wss://escalate-my-war-room.<subdomain>.workers.dev`

   (Must rebuild after setting Vite env vars.)

2. In `App.tsx` (or the live v1.2 shell):

```tsx
import { useWarRoom } from './hooks/useWarRoom'

const warRoom = useWarRoom({
  roomId: client.id, // e.g. demo-main
  name: 'Crisis Lead',
  wsBase: import.meta.env.VITE_WAR_ROOM_WS || '',
  enabled: Boolean(import.meta.env.VITE_WAR_ROOM_WS),
  onState: (s) => {
    setSeverity(s.severity)
    setChecked(s.checked)
    setClocksStarted(s.clocks)
    setLog(s.log)
    setStatement(s.statement)
    if (s.scenario) setScenario(s.scenario)
  },
})

// When local actions happen, also push:
handleSeverity = (level) => {
  setSeverity(level)
  warRoom.pushSeverity(level)
}
```

3. Show presence chip: `{warRoom.presence.length} in war room` + `warRoom.connected`.

## Message protocol (JSON)

**Client → server**

| type | fields |
|------|--------|
| hello | name |
| setSeverity | severity (1-4 \| null) |
| toggleCheck | index, value? |
| setChecked | checked[] |
| toggleClock | id, value? |
| addLog | text |
| setStatement | statement, scenario? |
| ping | |

**Server → client**

| type | fields |
|------|--------|
| state | full RoomState |
| presence | presence[] |
| pong | t |
| error | message |

## Test without UI

```bash
# Snapshot
curl "https://escalate-my-war-room.<sub>.workers.dev/state?room=demo-main"
```

Open two browser tabs with the same `room` query — checklist and severity should sync.

## Cost note

Durable Objects require **Workers Paid** ($5/mo minimum). Hibernation keeps idle rooms cheap. Suitable for listed-company war rooms (few concurrent sockets per incident).
