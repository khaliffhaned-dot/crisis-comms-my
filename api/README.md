# Escalate MY™

### Crisis Intelligence Platform for Malaysian Organisations

**From uncertainty to action in the moments that matter most.**

[![Platform](https://img.shields.io/badge/Platform-Crisis%20Intelligence-darkred)](#)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers%20%7C%20D1%20%7C%20R2-f38020)](#)
[![Architecture](https://img.shields.io/badge/Architecture-MCP%20Native-2563eb)](#)
[![Region](https://img.shields.io/badge/Region-Malaysia-dc2626)](#)
[![Language](https://img.shields.io/badge/Language-BM%20%2F%20EN-059669)](#)
[![Status](https://img.shields.io/badge/Status-Enterprise%20Preview-22c55e)](#)

---

## The First Hour Decides Everything.

Escalate MY helps organisations assess incidents, coordinate decision-makers, manage regulatory obligations and execute response actions through a unified Crisis Command Centre.

Built for public listed companies, government-linked companies, regulated industries and enterprise leadership teams.

**A product of [Quantum PR](docs/BRAND.md)** — crisis governance, reputation and decision support.

| | |
|--|--|
| **Launch Command Centre** | Web UI · Cloudflare Pages |
| **Platform Modules** | [docs/MODULES.md](docs/MODULES.md) |
| **Architecture** | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| **Brand & pitch** | [docs/BRAND.md](docs/BRAND.md) |

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

## Enterprise Architecture

```text
Cloudflare Pages
        │
        ▼
Escalate MY Web

Cloudflare Workers + Hono
        │
        ▼
Crisis Intelligence API
        │
 ┌──────┼──────┬───────┐
 ▼      ▼      ▼       ▼
D1      KV     R2      MCP
System  Config Reports Agents
of Record
```

---

## Repository Structure

```text
escalate-my/
├── apps/
│   ├── web/           # Command Centre UI (Pages)
│   ├── api/           # Hono Crisis Intelligence API
│   └── mcp-server/    # MCP tools for agents
├── packages/
│   ├── shared/        # Types, severity, errors
│   ├── core/
│   ├── incidents/     # First 60, holding, repos
│   ├── regulatory/    # MY regulatory clocks
│   └── boardbrief/    # R2 report generation
├── infrastructure/
│   ├── migrations/    # D1 schema
│   └── wrangler/
├── docs/
└── tests/
    ├── api/
    ├── mcp/
    └── integration/
```

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

Escalate MY is a **Crisis Intelligence Platform** that helps Malaysian organisations make faster, better decisions during critical incidents.

> Escalate MY™ is a Crisis Intelligence Platform that helps Malaysian organisations make faster, better decisions during critical incidents.

---

## Editions

| Edition | Focus |
|---------|--------|
| Starter | Single entity · core modules |
| Professional | Quorum · BoardBrief |
| Enterprise | Multi-user · audit · R2 exports |
| PLC Edition | Bursa-aware clocks · CoSec workflows |

---

## Engineering quick start

```bash
pnpm install
# Replace placeholder D1 / KV / R2 IDs in infrastructure/wrangler/wrangler.jsonc
pnpm db:migrate:local
pnpm dev:api
```

Deploy API: `pnpm deploy:api` · MCP: `pnpm deploy:mcp`

---

## Request Early Access

Transform crisis response from fragmented communications into structured decision-making.

**Escalate MY™**  
*Crisis Intelligence Platform for Malaysian Organisations.*

**Contact Quantum PR** for demonstration and pilot programmes.
