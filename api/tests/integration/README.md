# Integration tests

```text
MCP → Workers API → D1
```

1. `pnpm db:migrate:local`
2. `pnpm dev:api`
3. Hit `/api/v1/incidents` with a seed organisation_id
4. Point MCP `API_BASE` at the local API
