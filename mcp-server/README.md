# Escalate MY MCP Server

Remote playbook MCP server and authenticated incident API, deployed to Cloudflare Workers.

## MCP tools

| Tool | Purpose |
|------|---------|
| `list_severity_levels` | L1–L4 matrix + Bursa flags |
| `recommend_severity` | Suggest level from incident facts |
| `list_regulatory_clocks` | Bursa / PDPA / NACSA / DOSH clocks |
| `first_60_checklist` | 13-step first hour |
| `draft_holding_outline` | EN/BM holding outline by scenario |
| `product_status` | Live URLs and architecture notes |

These playbook tools are advisory and do not create or modify incidents.

## Cloudflare resources

The Worker config binds D1 (`DB`), R2 (`REPORTS`), and KV (`CACHE`). Before deploying:

1. Create a D1 database with `npx wrangler d1 create escalate-my` and put its returned ID in `mcp-server/wrangler.toml`.
2. Create the `escalate-reports` R2 bucket and a KV namespace; put the KV namespace ID in that config. Update the bucket name if you choose another name.
3. Set `INCIDENT_API_TOKEN` as a Worker secret. Use a long, unique random value and do not commit it: `npx wrangler secret put INCIDENT_API_TOKEN` (run from `mcp-server`). The incident HTTP API is disabled until this secret is set.
4. Install dependencies and apply the database migration: `npm install`, then `npx wrangler d1 migrations apply escalate-my --remote` (from `mcp-server`).
5. Deploy with `npx wrangler deploy` (from `mcp-server`).

The `REPLACE_WITH_D1_ID` and `REPLACE_WITH_KV_ID` values are intentionally placeholders; replace them before running Wrangler. Do not expose incident data through an unauthenticated endpoint.

## Incident API

Every endpoint below requires `Authorization: Bearer <INCIDENT_API_TOKEN>`. Requests and responses are JSON. The Worker returns `503` until the secret is configured.

- `GET /api/incidents` — list active incidents.
- `POST /api/incidents` — create an incident with `{ "title": "...", "severity": "...", "description": "..." }`.
- `GET /api/incidents/:id` — retrieve an incident.
- `POST /api/incidents/:id/close` — close an active incident.

## Connect from VS Code / GitHub Copilot

The workspace MCP config is in `.vscode/mcp.json`. Replace `<your-subdomain>` with the Workers account subdomain where `escalate-my-mcp` is deployed. The Cloudflare-managed MCP endpoint uses OAuth when first accessed. The Escalate MY MCP endpoint provides the playbook tools above.

## Deploy MCP endpoint

```bash
cd mcp-server
npm install
npx wrangler login
npx wrangler deploy
```

MCP URL: `https://escalate-my-mcp.<your-subdomain>.workers.dev/mcp`

## Safety note

Incident information can be sensitive. Use the authenticated API only over HTTPS, protect the API token, and ensure the deployment's access and data-retention controls meet your organization's requirements. The API does not include user-specific authorization or audit logging; do not treat the shared token as a substitute for those controls in a production incident-management system.
