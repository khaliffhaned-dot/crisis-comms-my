# Deploy CrisisComms MY to Alibaba Cloud OSS

## GitHub Actions

Workflow: `.github/workflows/deploy-aliyun.yml`

Triggers:
- Push to `main`
- Manual **Run workflow** from the Actions tab

### Required secrets

In the GitHub repo: **Settings → Secrets and variables → Actions**

| Secret | Example | Notes |
|--------|---------|--------|
| `ALIYUN_ACCESS_KEY_ID` | `LTAI...` | Use a RAM user, not the root account |
| `ALIYUN_ACCESS_KEY_SECRET` | `...` | Store only in GitHub Secrets |
| `ALIYUN_OSS_BUCKET` | `crisis-comms-my` | Bucket name only (no `oss://`) |
| `ALIYUN_OSS_ENDPOINT` | `oss-ap-southeast-1.aliyuncs.com` | Match bucket region |

Optional:

| Secret | Example |
|--------|---------|
| `ALIYUN_CDN_DOMAIN` | `app.yourdomain.com` |

### One-time OSS setup

1. Create a bucket (e.g. region **ap-southeast-1** Singapore).
2. **Data Management → Static Pages**:
   - Default homepage: `index.html`
   - Error page: `index.html` (SPA fallback)
3. Bucket ACL: public-read, or private + CDN only.
4. (Recommended) Bind CDN domain + HTTPS certificate.
5. Create a RAM user with OSS write permissions; create AccessKey; add secrets above.

### Local deploy (optional)

```bash
npm ci && npm run build
ossutil config   # set AK/SK and endpoint
ossutil sync dist/ oss://YOUR-BUCKET/ --delete --force
```

### After first deploy

- Open the OSS static website endpoint or your CDN domain.
- Confirm language toggle and Playbook load.
- If CDN was already caching `index.html`, refresh that path in the CDN console.

## Security notes

- Never commit AccessKeys.
- Prefer a RAM user limited to the target bucket.
- For production, prefer private bucket + CDN origin authentication.
