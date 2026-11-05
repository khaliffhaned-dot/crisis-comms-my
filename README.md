# Escalate MY™

### Crisis Governance Platform for Malaysian Organisations

**From uncertainty to action in the moments that matter most.**

[![Platform](https://img.shields.io/badge/Platform-Crisis%20Governance-darkred)](#)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers%20%7C%20D1%20%7C%20R2-f38020)](#)
[![Architecture](https://img.shields.io/badge/Architecture-MCP%20Native-2563eb)](#)
[![Region](https://img.shields.io/badge/Region-Malaysia-dc2626)](#)
[![Language](https://img.shields.io/badge/Language-BM%20%2F%20EN-059669)](#)
[![Status](https://img.shields.io/badge/Status-Enterprise%20Preview-22c55e)](#)

---

## Live

**[See it live →](https://escalate-my.pages.dev)** — run a guided, no-login simulation of a real incident, from the first signal to a board-ready summary, in under 3 minutes.

**A product of [Quantum PR](api/docs/BRAND.md)** — crisis governance, reputation and decision support.

---

## The First Hour Decides Everything.

Escalate MY™ is a **Crisis Governance Platform** that helps organisations detect emerging incidents, coordinate executive decisions and maintain an auditable record of crisis response.

Built for public listed companies, government-linked companies, regulated industries and enterprise leadership teams.

| | |
|--|--|
| **Platform Modules** | [api/docs/MODULES.md](api/docs/MODULES.md) |
| **Architecture** | [api/docs/ARCHITECTURE.md](api/docs/ARCHITECTURE.md) |
| **Brand & pitch** | [api/docs/BRAND.md](api/docs/BRAND.md) |

---

## Why Escalate MY?

Most crisis platforms focus on communication.
**Escalate MY focuses on decision-making.**

The platform transforms fragmented updates, competing priorities and regulatory uncertainty into structured operational response.

### What Escalate MY helps you do

- Assess incident severity (L1–L4)
- Coordinate executive decision-makers
- Track Malaysian regulatory obligations
- Execute first-hour response workflows
- Generate board-ready situation reports
- Maintain a complete audit trail
- Operate from a single source of truth

Recommendations only. Quorum before any external statement or filing.

---

## Platform Modules

| Module | Purpose |
|--------|---------|
| **Command Centre™** | Executive operational dashboard |
| **Incident Management™** | Lifecycle from detection to closure |
| **First Sixty Minutes™** | Guided first-hour response framework |
| **Severity Engine™** | L1–L4 incident classification |
| **Decision Quorum™** | Executive approval tracking |
| **Regulatory Clock™** | Bursa, PDPA, DOSH, NACSA, SC, BNM |
| **Holding Statement Builder™** | Structured BM / EN response frameworks |
| **BoardBrief™** | Executive and board reporting |
| **Audit Trail™** | Governance and accountability |

---

## Designed For

- Public Listed Companies (PLCs)
- Government-Linked Companies (GLCs)
- Critical Infrastructure Operators
- Healthcare Organisations
- Financial Institutions
- Enterprise Risk Functions
- Corporate Affairs Teams
- Crisis Committees

---

## Positioning

Escalate MY is **not** a communications platform.

Escalate MY is a **Crisis Governance Platform** — powered by Crisis Intelligence — that helps Malaysian organisations make faster, better decisions during critical incidents.

---

## Editions

| Edition | Focus |
|---------|--------|
| Starter | Single entity · core modules |
| Professional | Quorum · BoardBrief |
| Enterprise | Multi-user · audit · R2 exports |
| PLC Edition | Bursa-aware clocks · CoSec workflows |

---

## API wiring

Frontend calls the Worker at `/api/v1/intelligence/assess`.

Default base (override with env):

```text
VITE_API_BASE=https://<your-worker>.workers.dev
```

Set this as an environment variable on your Cloudflare Pages project, then redeploy. (Internal — ask the team for the project name and current Worker URL.)

Health check:

```bash
curl https://<your-worker>.workers.dev/health
```

If the API is unreachable, Decision Intelligence falls back to the local rules engine (`source: local`).

---

## Repository structure

```text
escalate_crisisintel/
├── src/              # Command Centre UI (Pages) — Vite + React + TS
├── apps/web/          # Lean 3-screen sales prototype — Vite + React + shadcn/ui
├── mcp-server/        # MCP tools for agents (escalate-my-mcp)
├── api/               # Crisis Intelligence API — pnpm workspace
│   ├── apps/api/       # Hono API (escalate-my-api) — also hosts the
│   │                     IncidentRoom Durable Object (see WAR-ROOM.md)
│   ├── packages/        # shared, incidents, regulatory, boardbrief
│   ├── infrastructure/  # D1 migrations, wrangler config
│   └── docs/             # Brand, positioning, architecture, modules
└── wrangler.toml       # Pages config (this repo's root deploy)
```

---

## For developers

| | |
|--|--|
| **Web app** | https://escalate-my.pages.dev |
| **API** | *Internal — see your Cloudflare dashboard (Workers & Pages → escalate-my-api) or ask the team.* |
| **MCP** | *Internal — see your Cloudflare dashboard (Workers & Pages → escalate-my-mcp) or ask the team.* |

Bilingual (Bahasa Malaysia + English) · Vite + React + TypeScript on Cloudflare Pages · Hono API on Workers · D1 · R2 · MCP

## Quick start

```bash
npm install
npm run dev
```

### API workspace

```bash
cd api
pnpm install
# Replace placeholder D1 / KV / R2 IDs in infrastructure/wrangler/wrangler.jsonc if provisioning fresh
pnpm db:migrate:local
pnpm dev:api
```

### MCP server

```bash
cd mcp-server
npm install
npm run dev
```

---

## Build & deploy

```bash
npm run build
npx wrangler pages deploy dist --project-name <your-pages-project>
```

Deploy API (includes the IncidentRoom Durable Object): `cd api && pnpm deploy:api` · Deploy MCP: `cd mcp-server && npm run deploy`

---

## Disclaimer

Operational guidance only — not legal advice. Verify obligations with counsel.

## Licence

Private / proprietary — for authorised use only.

---

**Contact Quantum PR** for demonstration and pilot programmes.
