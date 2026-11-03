# Escalate MY Core — implementation

## Modules shipped

1. **Command Centre** — open incidents, KPIs, quick links  
2. **Incident Management** — title, owner, status, L1–L4  
3. **First Sixty Minutes** — 13-step checklist (existing module)  
4. **Decision Quorum** — role votes pending/approved/rejected  
5. **Regulatory Clock** — verified MY clocks (existing module)  
6. **Holding Statement Builder** — scenario + BM/EN  
7. **Audit Trail** — append-only log + export  
8. **Organisation Directory** — 12 emergency contacts  

## Backend modes (`src/core/api.ts`)

| Mode | When | Behaviour |
|------|------|-----------|
| `local` | default | `localStorage` key `escalate-my-core-v1` |
| `api` | `VITE_API_BASE` set | `GET/PUT /incidents` |
| `war-room` | `VITE_WAR_ROOM_WS` set | badge only; persist still local until DO maps full Incident |

### Connect your backend

```bash
# Cloudflare Pages env
VITE_API_BASE=https://your-api.workers.dev
# optional realtime
VITE_WAR_ROOM_WS=wss://escalate-my-war-room.<sub>.workers.dev
```

Expected API:

- `GET /incidents` → `Incident[]`
- `PUT /incidents/:id` → body `Incident`, returns `Incident`

Types: `src/core/types.ts`

## Run

```bash
npm install
npm run dev
```

Open Playbook → Command Centre → New incident → walk Core nav.
