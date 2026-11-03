# Cloudflare Setup

This repository includes a Cloudflare Workers MCP server under `mcp-server/`.

- `.vscode/mcp.json` registers Cloudflare's managed MCP and the Escalate MY MCP server for VS Code / Copilot.
- `mcp-server/wrangler.toml` defines D1, R2, and KV bindings for the application.
- `mcp-server/migrations/0001_incidents.sql` creates the incident table and indexes.
- The incident API requires the `INCIDENT_API_TOKEN` Worker secret; it is disabled when the secret is unset.

Follow [the MCP server setup guide](mcp-server/README.md) to create the Cloudflare resources, replace the config placeholders, apply the migration, and deploy. Cloudflare MCP OAuth is initiated by the client on first use.
