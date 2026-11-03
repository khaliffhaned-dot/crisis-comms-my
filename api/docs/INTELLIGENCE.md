# Crisis Intelligence Layer

Escalate MY earns **Crisis Intelligence Platform** by recommending and enriching decisions — not by monitoring media.

## Do not build

Media monitoring · Social listening · Meltwater/Brandwatch clones

## Flow

```text
Incident → Risk assessment → Decision support
        → Recommended actions → Board brief / insights
```

## Implemented foundations

| Module | Endpoint | Behaviour |
|--------|----------|-----------|
| **Decision Intelligence™** | `POST /api/v1/intelligence/assess` | Severity, confidence, regulatory_risk, first_actions[] (rules engine; Workers AI-ready) |
| **Regulatory Intelligence™** | `POST /api/v1/intelligence/obligations` | Match facts → D1 `regulatory_obligations` |
| **Board Intelligence™** | `GET /api/v1/intelligence/board/:incidentId` | Top risks, pending decisions, exposure, readiness_score |

Migration: `infrastructure/migrations/0002_regulatory_obligations.sql`

## Hard rule

Recommendations only. **Decision Quorum** before any external statement or filing.

## Later (optional)

Similar Incident Intelligence · Operational Readiness Score (UI) · Scenario Intelligence (“what if national media?”) · Workers AI binding on assess

## Positioning (earned when these ship in product UI)

> Escalate MY™ — Crisis Intelligence Platform for Malaysian Organisations
