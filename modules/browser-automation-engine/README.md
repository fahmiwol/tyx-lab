# Browser Automation Engine

Tiered anti-detection browser launcher with automatic engine selection.

## Tier System

**FREE (recommended)**
1. patchright — Patches fingerprints at binary level
2. playwright-extra + stealth — 20+ detection patches
3. playwright — Standard fallback

**PRO**
4. Browserbase — Cloud browser + residential IP
5. Steel — Open-source cloud browser

## Why patchright?

- Patches navigator.webdriver at binary level
- Removes __playwright* properties
- Randomizes canvas fingerprint
- Same API as Playwright (zero code changes)

## Usage

```js
const { fetchPage } = require('@tiranyx/browser-engine');
const result = await fetchPage('https://example.com', {
  headless: true,
  waitForSelector: '.content'
});
```

*Open source — use it wisely.*