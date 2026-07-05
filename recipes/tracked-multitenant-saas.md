# Recipe: Tracked Multi-Tenant SaaS on Next.js

## Description
Stand up a single Next.js deployment that serves many tenants on their own subdomains,
verifies each domain in Meta Business Manager, and fires high-quality, deduplicated
Meta ads events — without a CAPI Gateway. Three atoms, one working funnel.

## Atoms Used
1. `artifacts/nextjs-subdomain-multitenant` — route `tenant.app.com` to a `[tenant]` segment via middleware.
2. `artifacts/facebook-domain-verification` — verify each domain, using the middleware exemption so verification files serve verbatim.
3. `artifacts/meta-capi-dedup` — fire browser Pixel + server CAPI with a shared `event_id` for EMQ 7+.

## Execution Order
```
1. Add the subdomain middleware (tenant routing + static/verification-file exemptions).
2. Add both FB verification methods; confirm the exemption regex covers .html/.txt/.xml.
3. Wire the CAPI client + browser tracker; fire PageView/ViewContent server-side with a
   shared event_id, mirror it in the browser fbq with {eventID}.
4. Verify: subdomain resolves, verification file returns verbatim, Events Manager shows
   "Deduplicated" events at EMQ 7+.
```

## Final Output
A multi-tenant SaaS where every tenant subdomain is domain-verified and every ad event
is deduplicated across browser and server — resilient to ad-blockers and iOS ITP.

---

*Open source — use it wisely.*