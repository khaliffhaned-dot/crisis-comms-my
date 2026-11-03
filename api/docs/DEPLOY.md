# Deploy Escalate MY API (real D1)

## 1. Login

```bash
cd escalate-my
pnpm install
npx wrangler login
```

## 2. Create resources

```bash
bash scripts/provision-cloudflare.sh
```

Or manually:

```bash
npx wrangler d1 create escalate-my-db
npx wrangler kv namespace create CONFIG
npx wrangler r2 bucket create escalate-my-reports
```

## 3. Patch `infrastructure/wrangler/wrangler.jsonc`

Replace placeholder IDs:

- `d1_databases[0].database_id`
- `kv_namespaces[0].id`

## 4. Migrate + deploy

```bash
npx wrangler d1 migrations apply escalate-my-db --remote --config infrastructure/wrangler/wrangler.jsonc
pnpm deploy:api
```

## 5. Smoke test

```bash
curl https://escalate-my-api.<sub>.workers.dev/health

curl -X POST https://escalate-my-api.<sub>.workers.dev/api/v1/intelligence/assess \
  -H 'content-type: application/json' \
  -d '{"facts":"Product recall, three customers, no national media","bursaListed":true}'
```

## 6. Wire UI

Cloudflare Pages (crisis-comms-my / escalate-my web) env:

```text
VITE_API_BASE=https://escalate-my-api.<sub>.workers.dev
```

Rebuild Pages after setting the variable.
