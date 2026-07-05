# Provider Quota Tracker

Admin-only quota tracking for shared provider resources.

## Why Admin-Only?

Shared providers (HF Token, RunPod) = 1 resource for all tenants.
When exhausted → ALL users impacted. Admin needs early alerts.

Per-tenant BYOK keys NOT tracked here.

## Alert Thresholds

- 70% — Warning
- 90% — Critical
- 100% — Exhausted

## Default Quotas

| Provider | Daily Cap | Monthly Cap |
|----------|-----------|-------------|
| Pollinations | 5,000 | — |
| HuggingFace | 1,000 | — |
| RunPod Chat | 9,999 | $30 |
| RunPod Media | 500 | $50 |

## Usage

```js
const { createQuotaTracker } = require('@tiranyx/quota-tracker');
const tracker = createQuotaTracker(adminStore);
tracker.log({ provider: 'runpod-chat', units: 7 });
const summary = tracker.summary();
```

*Open source — use it wisely.*