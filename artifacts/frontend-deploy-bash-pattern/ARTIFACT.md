# Frontend Deploy Pattern

Parameterized shell script for syncing frontend code, rebuilding app, restarting PM2, and verifying live endpoints. Useful for zero-downtime deployments.

## Why This Exists

Deploying frontends requires coordination: git pull, deps install, build, PM2 restart, file sync to static CDN, verify health. Without a script, each deploy is manual and error-prone. This pattern abstracts the workflow and makes it repeatable across projects.

## Key Features
- Automatic git pull with safety check (ff-only)
- Conditional npm install (only if deps outdated)
- PM2 process restart with env update
- Rsync sync to static directory (excludes git, node_modules, .env)
- Live verification (curl endpoints with 15s timeout)
- Verbose logging with emojis and section headers

## Usage
```bash
bash deploy-scripts/deploy-frontend.sh
```

Environment variables:
- `REPO_DIR` — project root (default: /opt/project)
- `LANDING_SRC`, `LANDING_DST` — sync paths
- `APP_DIR` — app directory
- `PM2_APP_NAME` — process name in PM2

## Deployment Flow
1. Pull latest from origin/main (fail if not FF)
2. Build app (npm ci or install)
3. Restart PM2 process
4. Sync landing to static directory
5. Verify health checks (title, version, backend status)

---

*Open source — use it wisely.*
