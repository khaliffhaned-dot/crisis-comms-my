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

These playbook tools are advisory and do not create or modify incidents. Incident CRUD is available only through the authenticated HTTP API described below.

## Cloudflare resources and deployment

This Worker binds D1 (`DB`), R2 (`REPORTS`), and KV (`CACHE`). Complete the resource setup before deploying:

1. From `mcp-server/`, create the D1 database with `npx wrangler d1 create escalate-my`, and replace `REPLACE_WITH_D1_ID` in `wrangler.toml` with the returned ID.
2. Create the R2 bucket `escalate-reports` (or change the configured name): `npx wrangler r2 bucket create escalate-reports`.
3. Create the KV namespace: `npx wrangler kv namespace create CACHE`; put the returned namespace ID in `wrangler.toml` in place of `REPLACE_WITH_KV_ID`.
4. Install dependencies with `npm install`.
5. Set a long, unique `INCIDENT_API_TOKEN` as a Worker secret using `npx wrangler secret put INCIDENT_API_TOKEN`. Do not commit the token. The incident API stays disabled until this secret is set.
6. Apply the migration remotely: `npx wrangler d1 migrations apply escalate-my --remote`.
7. Deploy with `npx wrangler deploy`.

The D1 and KV placeholders are intentionally invalid until replaced. Wrangler commands that load `wrangler.toml` may fail before resource setup, so create the D1/KV resources before installing/deploying as necessary, using an empty temporary configuration if Wrangler refuses the placeholders. Do not expose incident data through an unauthenticated endpoint.

## Incident API

Every endpoint requires `Authorization: Bearer <INCIDENT_API_TOKEN>`. Create requests must use `Content-Type: application/json`. Responses include `Cache-Control: no-store`; errors do not include internal exception details.

- `GET /api/incidents` — list active incidents.
- `POST /api/incidents` — create an incident with `{ "title": "...", "severity": "...", "description": "..." }`.
- `GET /api/incidents/:id` — retrieve an incident.
- `POST /api/incidents/:id/close` — close an incident.

The token is shared bearer authentication, not per-user identity or role-based access control. Add an appropriate access-control layer, audit logging, and operational data-retention controls before production use with sensitive incidents.

## Connect from VS Code / GitHub Copilot

The workspace MCP config is in `.vscode/mcp.json`. Replace `<your-subdomain>` with the Workers account subdomain where `escalate-my-mcp` is deployed. The Cloudflare-managed MCP endpoint uses OAuth on first use; the Escalate MY MCP endpoint serves the playbook tools.

## MCP URL

`https://escalate-my-mcp.<your-subdomain>.workers.dev/mcp`

## Safety note

Incident information can be sensitive. Use the authenticated API only over HTTPS, protect the API token, and ensure the deployment's access and data-retention controls meet your organization's requirements.
