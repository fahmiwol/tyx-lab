# Human-Like Timing Utilities

Sleep/delay helpers for realistic bot behavior.

## Functions

- sleep(ms) — Fixed delay
- random(min, max) — Random delay
- typing(charCount) — 60-180ms per char
- pageRead() — 1.2-4 seconds
- betweenActions() — 300ms-2s
- betweenRequests() — 2-8 seconds
- scrollPause() — 500ms-2s
- mouseMove() — 50-300ms

## Usage

```js
const { random, betweenRequests } = require('@tiranyx/timing');
await betweenRequests();  // Before fetching next URL
const page = await fetch(url);
```

*Open source — use it wisely.*