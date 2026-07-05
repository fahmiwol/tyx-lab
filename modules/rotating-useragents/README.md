# Rotating User-Agent Pool

Real browser User-Agents (2026 updated), weighted by market share.

## Market Share

- Chrome: 65%
- Mobile: 15%
- Safari: 10%
- Firefox: 5%
- Edge: 5%

## Browsers

- Chrome 129-131 (Windows, macOS)
- Firefox 131-132
- Safari 17-18
- Edge 131
- Mobile Chrome/Safari (Android 13-14, iOS 17-18)

## Usage

```js
const ua = require('@tiranyx/useragents');
const userAgent = ua.random();  // Random weighted
const desktop = ua.randomDesktop();
const mobile = ua.randomMobile();
ua.detectFamily(userAgent);  // 'chrome'|'firefox'|...
ua.secChUa(userAgent);       // Sec-Ch-Ua header value
```

*Open source — use it wisely.*