# Escalate MY MCP Server

Remote MCP server for crisis-ops agents. Deploy on Cloudflare Workers.

## Tools

| Tool | Purpose |
|------|---------|
| `list_severity_levels` | L1–L4 matrix + Bursa flags |
| `recommend_severity` | Suggest level from incident facts |
| `list_regulatory_clocks` | Bursa / PDPA / NACSA / DOSH clocks |
| `first_60_checklist` | 13-step first hour |
| `draft_holding_outline` | EN/BM holding outline by scenario |
| `product_status` | Live URLs and architecture notes |

## Deploy

```bash
cd mcp-server
npm install
npx wrangler login
npx wrangler deploy
```

MCP URL:

```
https://escalate-my-mcp.<your-subdomain>.workers.dev/mcp
```

## Connect from Cursor / Claude / other MCP clients

```json
{
  "mcpServers": {
    "escalate-my": {
      "url": "https://escalate-my-mcp.<your-subdomain>.workers.dev/mcp"
    },
    "cloudflare-api": {
      "url": "https://mcp.cloudflare.com/mcp"
    }
  }
}
```

## Official Cloudflare API MCP (account-wide)

For Workers, Pages, DNS, R2, etc. use Cloudflare’s managed server (OAuth):

- URL: `https://mcp.cloudflare.com/mcp`
- Docs: https://developers.cloudflare.com/agents/model-context-protocol/cloudflare/servers-for-cloudflare/

That is separate from this Escalate MY playbook MCP.
