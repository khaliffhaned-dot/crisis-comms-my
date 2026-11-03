# 0002 Client incident payload migration

Apply this migration to every D1 environment before deploying the Worker version that supports frontend incident records:

```sh
npx wrangler d1 migrations apply escalate-my --remote
```

The migration adds a nullable JSON-text column for the complete frontend incident model. Existing database columns remain indexed/queryable, and legacy rows continue to be returned through the stable API response.

The incident CRUD API still requires `Authorization: Bearer <INCIDENT_API_TOKEN>`. Do not put this shared token in a `VITE_*` variable or browser bundle. Browser CRUD must be routed through an authenticated server-side gateway that validates the user's identity and permissions, then calls this API with the Worker secret. Configure `VITE_INCIDENT_API_BASE` only to that trusted gateway. Keep `VITE_API_BASE` for the public intelligence-assessment service.
