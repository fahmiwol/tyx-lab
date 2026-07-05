# Multi-Channel Alert Notifier

Dispatch alerts via WhatsApp, email, logs with throttling.

## Channels

- **wa** — WhatsApp via Cosmix API
- **email** — SMTP (Phase 2)
- **log** — console.error

## Throttle

Max 1 alert per hour per (source, provider, level) combo.

## Usage

```js
const notifier = require('@tiranyx/notifier');
await notifier.dispatch({
  source: 'tuwaga',
  provider: 'runpod-chat',
  level: 'critical',
  message: 'Quota at 90%',
  channels: ['wa', 'log']
});
```

## Config

```bash
ALERT_WA_NUMBER=628xxxxx
ALERT_WA_RECIPIENTS_JSON='["628xxx","628yyy"]'
COSMIX_INTERNAL_URL=http://127.0.0.1:5104
INTERNAL_CONFIG_TOKEN=...
```

*Open source — use it wisely.*