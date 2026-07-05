# Shopee Open Platform — Partner App Integration

**Kind:** playbook · **Category:** ops · **Status:** stable

Build a Shopee **Partner App** so one developer account can onboard many seller shops
via OAuth — HMAC-SHA256 request signing, a 4-hour access token + 30-day refresh token
lifecycle, and a minimum-scope strategy that shortens production review. Legitimate,
supported API access instead of scraping the anti-bot storefront. One app can serve
ID/MY/SG/TH/PH/VN/BR/TW.

---

## Why this exists

Scraping Shopee''s storefront is fragile and anti-bot protected. The Open Platform is
the supported path, but its OAuth is non-standard (custom HMAC signing) and its review
gate is easy to fail. This playbook encodes the working flow and the review tactics so
an agency/SaaS can go from zero to "2-click OAuth onboarding per new client" after a
one-time 1-2 week review.

## Account type

- **Shop App** — a tool for your own single shop (self-only token).
- **Partner App** — agency/SaaS for many sellers (multi-tenant OAuth). Choose this for
  catalog/biolink/management tools.

Register at `open.shopee.com` with company docs; you receive `partner_id` and
`partner_key` (the HMAC secret — server-side only, never shipped to the browser), plus
separate sandbox credentials.

## Architecture: 1 account -> many shops

```
Your Backend
 └─ 1 Partner App (partner_id + partner_key)
    ├─ scope: product.info_read, shop.info_read, image.upload
    ├─ Client A authorizes -> access_token_A + shop_id_A + refresh_token_A
    ├─ Client B authorizes -> access_token_B + shop_id_B + refresh_token_B
    └─ per-shop calls signed with (partner_id, partner_key, shop_id, access_token)
```

Store one row per `(partner_id, shop_id)`: access token, refresh token, both expiries,
region. Refresh proactively when the access token has < 30 min left.

## OAuth + signing (HMAC-SHA256)

```ts
import crypto from "node:crypto";

// 1. Authorization URL
const path = "/api/v2/shop/auth_partner";
const ts = Math.floor(Date.now() / 1000);
const sign = crypto.createHmac("sha256", partnerKey)
  .update(`${partnerId}${path}${ts}`).digest("hex");
const authUrl = `https://partner.shopeemobile.com${path}` +
  `?partner_id=${partnerId}&timestamp=${ts}&sign=${sign}` +
  `&redirect=${encodeURIComponent(redirectUri)}`;

// 2. Callback: GET ...?code=XXX&shop_id=123

// 3. Exchange code -> token  (POST /api/v2/auth/token/get)
//    body { code, shop_id, partner_id } -> { access_token, refresh_token, expire_in }
//    expire_in = 14400s (4h); refresh_token TTL = 30 days.

// 4. Signed API call — access_token + shop_id are folded into the base string:
const p = "/api/v2/product/get_item_list";
const t = Math.floor(Date.now() / 1000);
const s = crypto.createHmac("sha256", partnerKey)
  .update(`${partnerId}${p}${t}${accessToken}${shopId}`).digest("hex");
const url = `https://partner.shopeemobile.com${p}` +
  `?partner_id=${partnerId}&timestamp=${t}&access_token=${accessToken}` +
  `&shop_id=${shopId}&sign=${s}&offset=0&page_size=50&item_status=NORMAL`;

// 5. Refresh (POST /api/v2/auth/access_token/get) — BOTH tokens rotate; replace both.
```

Sandbox host: `partner.test-stable.shopeemobile.com`. Production host:
`partner.shopeemobile.com` (same across regions).

## Sensitive data is masked by default

Buyer name/phone/email/address come back masked. To unmask (order/logistics scopes)
Shopee requires an **IP allowlist** (declare fixed server IPs — use a static VPS IP,
not serverless) and, for some regions/scopes, a **penetration test report** from an
accredited tester (valid 2 years). Product/shop endpoints are never masked and need
neither.

| Scope | Pen test + IP allowlist? |
|---|---|
| `product.info_read`, `shop.info_read`, `image.upload` | No |
| `order.info_read` (buyer PII), `logistics.get_address_list` | Yes |
| financial/payment account scopes | Yes + extra ISV review |

## Minimum-scope strategy (faster review)

Request only what you demo. Start with `product.info_read` + `shop.info_read`
(+ `image.upload` if uploading). Add `order.info_read` in a later phase when you can
demonstrate a Purchase-event flow. Avoid `product.info_update` until the edit UI
exists — it draws much heavier scrutiny.

## Review submission (cut 2 weeks toward 1)

Reviewers want: a **concrete** app description (what platform, doing what, using which
scopes and why), a 60-90s sandbox demo video (OAuth -> product list rendered from API
-> one click-through), a privacy policy that references Shopee data and revocation, a
square logo + screenshots, and an error-handling demo (token refresh, 4xx, revoke).
Common rejections: vague description, unused scopes requested, no working demo, non-HTTPS
callback, low-res logo.

## Post-production pitfalls

| Pitfall | Fix |
|---|---|
| 429 rate limit | ~1000 req/min per shop — cache; prefer webhooks over polling. |
| `error_auth` mid-session | Access token expired — add proactive refresh at < 30 min left. |
| Refresh token expired (30d idle) | Force re-authorization; email the seller to reconnect. |
| Timestamp drift > 5 min | NTP-sync the server; Shopee rejects drifted signed requests. |

Webhook signature: `Authorization` header = HMAC-SHA256 of `(url + body)` with `partner_key`.

## References

- `open.shopee.com` · `open.shopee.com/documents` (OpenAPI 2.0 overview + API reference)

---

*Open source — use it wisely. Respect Shopee''s ToS, buyer privacy, and per-region data isolation.*