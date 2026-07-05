# Deploy Helper Scripts

Reusable bash scripts for Node.js SaaS production deployment.

## Features

- NVM auto-detection
- git pull with error handling
- npm install (legacy-peer-deps)
- Build step
- PM2 restart
- Timestamped logging

## Bash Template

```bash
#!/bin/bash
set -e
ROOT=/www/wwwroot/your-app
echo "[deploy] Starting $(date '+%Y-%m-%d %H:%M:%S')"
cd $ROOT
source ~/.nvm/nvm.sh
nvm use 22 --silent

echo "[1/4] git pull..."
git pull origin main

echo "[2/4] npm install..."
npm install --legacy-peer-deps

echo "[3/4] npm build..."
npm run build

echo "[4/4] pm2 restart..."
pm2 restart your-app --update-env
```

## PM2 Config

```js
module.exports = {
  apps: [{
    name: 'your-app',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/www/wwwroot/your-app',
    instances: 1,
    max_memory_restart: '1G',
    env: { NODE_ENV: 'production', PORT: 3000 }
  }]
};
```

*Open source — use it wisely.*