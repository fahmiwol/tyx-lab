# Stealth Fetch Engine

Anti-detection HTTP client using system curl to evade WAF fingerprinting.

## Why curl?

- Node.js https has detectable JA3 fingerprint (flagged by Cloudflare, Akamai)
- curl uses different TLS cipher order, less detectable
- Browser-mimicking headers (Sec-Fetch-*, Sec-Ch-Ua)

## Features

- Rotating User-Agent (desktop + mobile)
- Chrome-mimicking headers
- Proxy support (HTTP/SOCKS)
- Automatic redirect following (10 hops)
- Gzip + Brotli decompression
- Timeout handling

## Usage

```js
const { fetch, get, post } = require('@tiranyx/stealth-fetch');
const r = await get('https://example.com');
console.log(r.status, r.data);
```

*Open source — use it wisely.*