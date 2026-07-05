# Next.js Subdomain Multi-Tenant Routing

**Kind:** playbook · **Category:** infra · **Status:** stable

One Next.js deployment serving many tenants, each on their own subdomain
(`acme.app.com`, `beta.app.com`), rewritten to a `[tenant]` route segment by
middleware — with correct exemptions for `/api`, `/_next`, and site-verification files,
plus a localhost fallback for dev.

---

## Why this exists

Multi-tenant SaaS wants `tenant.app.com` to render that tenant''s pages without
deploying a copy per tenant. Middleware can rewrite the host''s subdomain into a route
param — but the naive version breaks two things: (1) it rewrites static and
verification files (`/token.html` -> 404), and (2) it has no dev story for localhost.
This pattern handles both, and passes the original path down via a header so layouts
can branch (e.g. show admin chrome only on `/admin`).

## URL model

```
acme.app.com/         -> [tenant]/page.tsx        (tenant=acme)
acme.app.com/store    -> [tenant]/store/page.tsx
acme.app.com/api/*    -> app/api/*   (apex API, NO rewrite)
app.com/ , www.app.com/ -> apex landing (NO rewrite)
localhost:3000/       -> DEFAULT tenant (dev convenience)
acme.localhost:3000/  -> [tenant] with tenant=acme
```

## middleware.ts

```ts
import { NextResponse, type NextRequest } from "next/server";

const DEFAULT_TENANT = process.env.NEXT_PUBLIC_DEFAULT_TENANT ?? "demo";
const ROOT_DOMAIN = (process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "app.com").toLowerCase();

export function middleware(req: NextRequest) {
  const host = (req.headers.get("host") ?? "").toLowerCase();
  const url = req.nextUrl;
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-app-pathname", url.pathname);

  // Never rewrite: apex-level + static + verification files.
  // The regex catches .html/.txt/.xml/image files for site verification
  // (Facebook, Google Search Console, Bing) that MUST serve verbatim.
  if (
    url.pathname.startsWith("/api") ||
    url.pathname.startsWith("/_next") ||
    url.pathname === "/favicon.ico" ||
    url.pathname === "/robots.txt" ||
    url.pathname === "/sitemap.xml" ||
    /\.(html|txt|xml|png|jpg|jpeg|svg|webp|ico)$/i.test(url.pathname)
  ) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  const hostNoPort = host.split(":")[0] ?? "";
  const isLocalhost = hostNoPort === "localhost" || hostNoPort === "127.0.0.1";
  const isApexProd = hostNoPort === ROOT_DOMAIN || hostNoPort === `www.${ROOT_DOMAIN}`;

  if (isApexProd) return NextResponse.next({ request: { headers: requestHeaders } });

  let subdomain: string | null = null;
  if (isLocalhost) {
    const dot = host.indexOf(".");
    if (dot > 0) subdomain = host.slice(0, dot);
  } else if (hostNoPort.endsWith(`.${ROOT_DOMAIN}`)) {
    subdomain = hostNoPort.slice(0, -ROOT_DOMAIN.length - 1);
  }

  const tenant = subdomain || DEFAULT_TENANT;
  url.pathname = `/${tenant}${url.pathname === "/" ? "" : url.pathname}`;
  return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
```

## Why the `x-app-pathname` header

The rewrite mutates `url.pathname` internally, so a layout can no longer see what the
user actually requested. Pass the original path as a custom header and read it in the
layout to branch (e.g. render admin chrome only when the real path starts with
`/admin`).

## DNS + TLS

```
A   app.com       -> server_ip
A   *.app.com     -> server_ip     (wildcard)
A   www.app.com   -> server_ip
```

Wildcard cert via Let''s Encrypt DNS-01:

```bash
certbot certonly --dns-cloudflare \
  --dns-cloudflare-credentials /path/cloudflare.ini \
  -d app.com -d "*.app.com"
```

Dev subdomains: modern browsers route `acme.localhost` to 127.0.0.1 without editing
the hosts file.

## Tenant resolution (cached)

```ts
import { unstable_cache } from "next/cache";
export const getTenantBySubdomain = unstable_cache(
  async (subdomain: string) => db.tenant.findUnique({ where: { subdomain } }),
  ["tenant-by-subdomain"], { revalidate: 60, tags: ["tenant"] }
);
// Invalidate on edit: revalidateTag("tenant")
```

## Gotchas

| Gotcha | Fix |
|--------|-----|
| Verification `.html` returns 404 | Middleware rewrote it. Add `.html` to the exempt regex. |
| Dev needs a subdomain | Use `acme.localhost:3000` (no hosts edit needed). |
| Cross-subdomain session | Set `Domain=.app.com` on the cookie; omit Domain for subdomain-only. |
| `generateStaticParams` over all tenants | Do not — tenants live in the DB. Use per-request cache / `force-dynamic`. |

---

*Open source — use it wisely.*