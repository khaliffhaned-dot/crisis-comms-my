#!/usr/bin/env bash
# Run on a machine logged into Cloudflare: npx wrangler login
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CFG="$ROOT/infrastructure/wrangler/wrangler.jsonc"

echo "==> Creating D1 database escalate-my-db"
npx wrangler d1 create escalate-my-db

echo ""
echo "==> Creating KV namespace CONFIG"
npx wrangler kv namespace create CONFIG

echo ""
echo "==> Creating R2 bucket escalate-my-reports"
npx wrangler r2 bucket create escalate-my-reports || true

echo ""
echo "Paste the database_id and KV id into $CFG"
echo "Then run: pnpm db:migrate:remote && pnpm deploy:api"
