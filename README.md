# Escalate MY

**Crisis Intelligence Platform for Malaysian Organisations.**

Live: https://escalate-my.pages.dev  
API: https://escalate-my-api.khaliffhaned.workers.dev  
MCP: https://escalate-my-mcp.khaliffhaned.workers.dev/mcp

Bilingual (Bahasa Malaysia + English) · Vite + React + TypeScript  
Company: Quantum PR

## Product

- Landing — Crisis Intelligence positioning
- Command Centre
- Incident Management
- First Sixty Minutes
- Decision Quorum
- Regulatory Clock
- Holding Statement Builder
- Audit Trail
- Decision Intelligence™ / Regulatory Intelligence™ / Board Intelligence™

Recommendations only. Quorum before any external statement or filing.

## API wiring

Frontend calls the Worker at `/api/v1/intelligence/assess`.

Default base (override with env):

```text
VITE_API_BASE=https://escalate-my-api.khaliffhaned.workers.dev
```

Set this on the Cloudflare Pages project **escalate-crisis-intel**, then redeploy.

Health check:

```bash
curl https://escalate-my-api.khaliffhaned.workers.dev/health
```

If the API is unreachable, Decision Intelligence falls back to the local rules engine (`source: local`).

## Quick start

```bash
npm install
npm run dev
```

## Build & deploy

```bash
npm run build
npx wrangler pages deploy dist --project-name escalate-crisis-intel
```

## Disclaimer

Operational guidance only — not legal advice. Verify obligations with counsel.

## Licence

Private / proprietary — for authorised use only.
