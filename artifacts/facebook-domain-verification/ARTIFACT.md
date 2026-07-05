# Facebook Business Domain Verification (dual-method)

**Kind:** playbook · **Category:** ops · **Status:** stable

Verify a domain in Meta Business Manager using **both** the meta-tag method and the
HTML-file method at once (redundancy), plus the Next.js middleware fix that stops a
subdomain rewriter from turning the verification file into a 404.

---

## Why this exists

Meta domain verification silently fails on SSR apps with middleware: the rewriter
sends `/<token>.html` to `/[tenant]/<token>.html`, which 404s, so Meta never sees the
file. Shipping **both** methods (meta tag + file) plus a path exemption makes
verification reliable on the first try, and the same exemption also fixes Google
Search Console and Bing verification.

## Method A — meta tag (simplest for SSR)

```ts
// app/layout.tsx (root)
export const metadata = {
  other: { "facebook-domain-verification": "YOUR_TOKEN_HERE" },
};
```

Verify: `curl -s https://yourdomain.com/ | grep facebook-domain-verification`

## Method B — HTML file at root

```bash
echo -n "YOUR_TOKEN_HERE" > public/YOUR_TOKEN_HERE.html
```

Verify: `curl -s https://yourdomain.com/YOUR_TOKEN_HERE.html` -> the token verbatim.

## Critical: middleware exemption

If the app uses middleware (e.g. for subdomain routing), it will rewrite
`/<token>.html` and 404 it. Exempt verification files BEFORE any rewrite:

```ts
if (
  url.pathname.startsWith("/api") ||
  url.pathname.startsWith("/_next") ||
  url.pathname === "/favicon.ico" ||
  url.pathname === "/robots.txt" ||
  url.pathname === "/sitemap.xml" ||
  /\.(html|txt|xml|png|jpg|jpeg|svg|webp|ico)$/i.test(url.pathname)
) {
  return NextResponse.next();
}
```

That one regex also covers Google (`google<token>.html`), Bing (`BingSiteAuth.xml`),
`ads.txt` / `app-ads.txt`, and OG image fallbacks.

## Workflow

1. Meta -> Business Settings -> Brand Safety -> Domains -> Add -> pick "meta-tag" -> copy token.
2. Add both methods in code (file + meta tag) and the middleware exemption.
3. Deploy, wait 1-3 min.
4. Verify locally with the two curl commands above.
5. Click "Verify Domain" in Meta. If it fails, retry in 5-15 min (Meta caches; up to 72h).

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| HTML file returns 404 | Middleware exemption missing — check the regex. |
| Meta tag absent from HTML | `metadata` must be in the ROOT layout, not a page. |
| Verified then reverts | Domain also claimed by another Business Manager — resolve ownership conflict. |
| Subdomain verified but apex is not | Meta verifies the EXACT host. Verify the apex to cover subdomains for ad attribution. |
| Need wildcard | Not supported — verify each subdomain, or verify the apex. |

---

*Open source — use it wisely.*