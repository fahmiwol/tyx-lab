# Shopee Storefront to Your DB — decision tree

**Kind:** playbook · **Category:** ops · **Status:** stable

Shopee''s anti-bot is among the most sophisticated in SEA e-commerce. This is the
**realistic** set of paths to get product names/prices/images/descriptions into your
own database, ranked by reliability — with the dead ends documented so you do not waste
hours on them.

---

## Why this exists

Every "just scrape Shopee automatically" request runs into an anti-bot wall that stops
~95% of attempts. The value here is knowing, before you start, which path actually
works for your situation — and refusing to promise clients an approach that will fail.

## Decision tree (read first)

```
Can you get Seller Center access from the merchant?
├─ YES -> Path A: Seller Center CSV export (5 min, 100% of the data)
└─ NO
   ├─ Merchant has a CPAS/Meta catalog feed? -> Path B: Meta Catalog API
   ├─ Budget ~$0.01/product OK?               -> Path C: paid scraper actor (e.g. Apify)
   ├─ Skilled engineer + time to burn?        -> Path D: reverse-engineer signed headers (NOT recommended)
   └─ Need a fast skeleton with real names?   -> Path E: manual seed from a screenshot
```

## What does NOT work (do not waste time)

- **Raw HTTP to the storefront search API** — returns an error/empty even with full
  browser headers + cookies. Missing signed headers (`af-ac-enc-dat`, `x-sap-sec`)
  computed by obfuscated runtime JS.
- **Bare headless Playwright** — the product-feed call is silently suppressed; the JS
  challenge detects the browser before products load.
- **Stealth patches (`navigator.webdriver`, AutomationControlled off)** — detection is
  deeper: canvas fingerprint, TLS JA3, audio context.
- **Reusing Playwright cookies in a raw fetch** — tokens are session+IP+UA bound and expire fast.

## Path A — Seller Center CSV export (recommended)

Ask the merchant to log into Seller Center -> My Products -> Export -> All Products
(Excel/CSV). The export has full fields (code, name, description, variations, price,
stock, image URLs, category, weight). Parse and upsert:

```ts
import { parse } from "csv-parse/sync";
const rows = parse(await fs.readFile(file, "utf8"), { columns: true, skip_empty_lines: true });
for (const r of rows) {
  await db.product.upsert({
    where: { id: `shopee_${r["Product Code"]}` },
    create: {
      id: `shopee_${r["Product Code"]}`,
      name: r["Product Name"],
      description: r["Product Description"]?.slice(0, 500),
      imageUrl: r["Main Image URL"],
      priceMinor: parseInt(r["Price"], 10),
      active: r["Status"] === "Active",
    },
    update: {},
  });
}
```

## Path B — Meta Catalog API (if CPAS is active)

An Official Shop with CPAS already syncs its catalog to Meta. Create a Business
**System User**, grant it the catalog asset with `catalog_management`, generate a
non-expiring token, then:

```bash
curl -s "https://graph.facebook.com/v21.0/CATALOG_ID/products?fields=id,name,description,price,image_url,url,brand,category,availability&limit=100&access_token=TOKEN"
```

Map the result into your product schema (same shape as Path A).

## Path C — paid scraper actor

Services like Apify''s Shopee actors cost roughly $10 per 1,000 products and return
title/price/image/description/variants/ratings. Good when you have no merchant access
but a small budget.

## Path E — manual seed from a screenshot (best zero-access fallback)

Have the client send a screenshot of the "best sellers" tab; hand-extract the top ~10
into a seed array with real names + prices, deep-link each to the storefront category,
and let the user upload images later. Faster than hours of bypass attempts.

## Reference formats

- Item URL: `https://shopee.<tld>/{slug}-i.{shopid}.{itemid}`
- API price is fixed-point: `price_minor = price * 100000` (5 decimals).
- Image CDN URLs are hotlinkable but can break on cache invalidation — for production,
  download and re-host on your own CDN.

## Lessons

- Do not promise "we''ll scrape Shopee automatically" — anti-bot stops most attempts.
- Always ask for Seller Center access / CSV first, even if the client finds it a hassle.
- Manual seed beats 4 hours of bypass engineering for a first launch.

---

*Open source — use it wisely. Respect Shopee''s ToS and the merchant''s consent to use their data.*