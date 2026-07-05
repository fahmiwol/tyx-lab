# Nginx Security Headers Pattern

Production-grade security and performance headers for nginx. Covers HTTPS/TLS, XSS, clickjacking, content type, referrer policy, permissions, and compression. Handles Service Worker and PWA manifest separately.

## Why This Exists

Security headers are easy to get wrong: missing STS, permissive CSP, broken CORS. This pattern is tested in production and covers:
- **HTTPS enforcement**: 301 redirect from HTTP, HSTS pre-load
- **XSS & framing**: X-Frame-Options, X-Content-Type-Options, Content-Security-Policy via meta tags
- **Referrer control**: strict-origin-when-cross-origin (default safe policy)
- **Permissions**: camera/microphone gating, interest-cohort disabled
- **Service Worker**: no-cache, must-revalidate (allows 304 fast-path)
- **PWA manifest**: short TTL for updates
- **Compression**: Brotli + gzip with type/size filtering
- **Cache control**: per-location granularity (HTML must-revalidate, assets long cache, SW no-cache)

## Key Points
- nginx add_header is replaced (not merged) in nested location blocks — repeat headers if overriding
- ETag auto-set for static files — use must-revalidate + 304 for efficiency
- Brotli preferred over gzip for text; gzip fallback
- Permissions-Policy replaces (deprecated) Feature-Policy

---

*Open source — use it wisely.*
