# PM2 Ecosystem Config with Feature Flags

Multi-process ecosystem file demonstrating A/B testing and feature gating via environment variables. Includes health check cron, autorestart policies, and mixed interpreter types (bash, node, serve).

## Why This Exists

Running multiple services (backend, frontend, sidecars) in one VPS requires PM2 orchestration. This pattern shows:
- **Feature flags in env**: disable/enable services (e.g., SIDIX_RERANK: '0'), test new code without stopping others
- **Mixed interpreters**: bash scripts, node apps, serve binary — all managed together
- **Selective autorestart**: some processes are cron-only (health checks), others always restart on crash
- **Explicit app order**: logical grouping (brain, ui, mcp, health)
- **Comments on decisions**: why is reranking disabled? Document it in env comments for future ops

## Key Features
- Environment variables per app — easy A/B testing
- Cron restart for scheduled tasks (e.g., `*/15 * * * *` for every 15 min)
- autorestart: false for health checks (cron drives them)
- Working directories (cwd) per app
- Inline comments explaining feature gate decisions (date, rationale, metrics)

## Usage
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Update config and reload:
```bash
pm2 reload ecosystem.config.js
```

View logs:
```bash
pm2 logs <app-name>
```

---

*Open source — use it wisely.*
