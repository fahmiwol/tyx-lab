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