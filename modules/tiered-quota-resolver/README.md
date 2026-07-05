# Tiered Quota & Rate-Limit Resolver

SaaS quota management: Admin (unlimited) → Pro (500/day) → Free (5/day) → Anonymous (2/day).

## Why

Monetize tool access via tiers:
- **Admin**: Internal team, unlimited
- **Pro**: Paid license, high quota + coin overage
- **Free**: Logged-in users, limited quota + coin option
- **Anonymous**: No signup, minimal quota, no coins

Single function returns tier, usage, and charge status.

## Usage

```typescript
import { checkAndChargeQuota } from '@/lib/tiered-quota-resolver';

// In API route
export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';
  const result = await checkAndChargeQuota('image-upscaler', ip);

  if (!result.allowed) {
    return Response.json({ error: result.reason }, { status: 429 });
  }

  const { tier, charged } = result;
  console.log(`Tier: ${tier}, Charged: ${charged}`);

  // Process the tool call
  return Response.json({ status: 'ok' });
}
```

## Tiers

| Tier | Daily Free | Overage | Auth | Notes |
|------|-----------|---------|------|-------|
| admin | Unlimited | N/A | trx_admin cookie | Internal team |
| pro | 500 | Via coins | trx_user + active license | Paid tier |
| free | 5 | Via coins | trx_user, no license | Logged-in user |
| anon | 2 | None | None | IP hash only |

## Authentication

Cookie resolution (priority):
1. `trx_admin` → admin token (instant admin access)
2. `trx_user` → user token + license check
   - If `role_id=1` or `is_owner=1` → admin
   - If active non-demo `platform_license` → pro
   - Otherwise → free
3. None → anonymous (IP-based quota)

## Coin Billing

When user exceeds daily quota:

```typescript
// Pro user: 500 free, then coins
// Free user: 5 free, then coins

const ok = await deductToolCoin(userId, toolSlug);
if (!ok) return { allowed: false, reason: 'Insufficient coins' };
```

Cost per tool defined in `TOOL_COIN_COST` config.

## Database Schema

```sql
-- Track logged-in user usage
CREATE TABLE tool_usage (
  user_id TEXT,
  tool_slug TEXT,
  usage_date TEXT,
  count INT,
  PRIMARY KEY (user_id, tool_slug, usage_date)
);

-- Track anonymous usage by IP hash
CREATE TABLE tool_usage_anon (
  ip_hash TEXT,
  tool_slug TEXT,
  usage_date TEXT,
  count INT,
  PRIMARY KEY (ip_hash, tool_slug, usage_date)
);

-- Optional: daily quota snapshot for analytics
CREATE TABLE quota_log (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  tool_slug TEXT,
  usage_date TEXT,
  count INT,
  tier TEXT,
  charged BOOLEAN,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Integration Example (Next.js API Route)

```typescript
import { checkAndChargeQuota } from '@/lib/tiered-quota-resolver';

export async function POST(request: Request) {
  const { prompt } = await request.json();
  const ip = request.headers.get('x-forwarded-for') || '127.0.0.1';

  // Check quota
  const quota = await checkAndChargeQuota('text-generator', ip);

  if (!quota.allowed) {
    return Response.json(
      { error: quota.reason },
      { status: 429 }
    );
  }

  // Log for analytics
  console.log(`Tool: text-generator, Tier: ${quota.tier}, Charged: ${quota.charged}`);

  // Generate content
  const result = await generateContent(prompt);

  return Response.json(result);
}
```

## Configuration

Define per-tool costs in `lib/billing.ts`:

```typescript
export const TOOL_COIN_COST: Record<string, number> = {
  'image-upscaler': 10,      // 10 coins per use after quota
  'text-generator': 5,
  'video-editor': 25,
};
```

Coins can be purchased or earned. Deduction is logged per user/tool/date.

## Analytics

Query daily usage by tier:

```sql
SELECT
  DATE(created_at) as date,
  tier,
  COUNT(*) as requests,
  SUM(CASE WHEN charged THEN 1 ELSE 0 END) as paid_requests
FROM quota_log
GROUP BY date, tier
ORDER BY date DESC;
```

*Open source — use it wisely.*
