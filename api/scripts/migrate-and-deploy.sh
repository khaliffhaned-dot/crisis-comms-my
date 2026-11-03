#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "==> Apply D1 migrations (remote)"
npx wrangler d1 migrations apply escalate-my-db --remote --config infrastructure/wrangler/wrangler.jsonc

echo "==> Deploy API Worker"
pnpm --filter @escalate-my/api deploy

echo "Done. Set VITE_API_BASE on Pages to https://escalate-my-api.<subdomain>.workers.dev"
