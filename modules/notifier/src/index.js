const notifier = require('@tiranyx/notifier');
await notifier.dispatch({
  source: 'a-content-pipeline',
  provider: 'runpod-chat',
  level: 'critical',
  message: 'Quota at 90%',
  channels: ['wa', 'log']
});