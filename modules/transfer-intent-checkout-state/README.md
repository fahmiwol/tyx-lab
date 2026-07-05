# Transfer Intent Checkout State

**Problem:** Merchants embed payment widgets on foreign domains. Browser CORS blocks direct calls to bank API. Widget needs to create intent, get checkout URL, user pays, server settles — all while bridging CORS boundary.

**Solution:** CORS-safe proxy + state machine:

1. **Client (Foreign Site)** → POST to proxy with apiKey
2. **Proxy** → Validates apiKey, forwards to bank with x-internal-key
3. **Bank** → Creates intent (PENDING), returns checkoutUrl
4. **User** → Confirms payment on checkoutUrl
5. **Bank** → Settles, transitions to COMPLETED

Includes expiryMinutes + cancellation.

## Interface

```typescript
interface TransferIntent {
  id: string;
  status: 'PENDING' | 'COMPLETED' | 'EXPIRED' | 'CANCELED';
  denom: Denomination;
  amount: number;
  description: string;
  checkoutUrl: string;
  successUrl: string;
  cancelUrl: string;
  expiresAt: ISO8601;
  metadata?: Record<string, unknown>;
}

// Public (from merchant site)
async function createIntent(apiKey: string, {
  amount, denom, description, metadata,
  successUrl, cancelUrl
}): Promise<{ id, checkoutUrl, expiresAt }>;

// Internal (bank server only)
async function confirmIntent(intentId: string, userId: string);
async function cancelIntent(intentId: string);
async function getIntent(intentId: string): Promise<TransferIntent>;
```

## Usage

```html
<!-- Merchant widget -->
<script src="https://example.com/widget.js"></script>
<script>
  createIntent({
    apiKey: 'BRK-123-SUP-456',
    amount: 500,
    denom: 'SILVER',
    description: 'Membership Fee',
    successUrl: 'https://merchant.com/success',
    cancelUrl: 'https://merchant.com/cancel'
  }).then(({ checkoutUrl }) => {
    window.location = checkoutUrl;
  });
</script>
```

## Key Patterns

- **CORS-safe:** Proxy validates apiKey locally, then calls bank internal API
- **Timeout-aware:** expiresAt prevents stale intents
- **Stateful:** PENDING → COMPLETED or EXPIRED/CANCELED
- **Idempotent confirm:** Repeated confirmIntent calls are safe
- **Redirect-based UX:** successUrl + cancelUrl post-payment redirect

## Security

- **API Key Format:** BRK-{brangkasId}-SUP-{supplierId}
- **Internal Key Required:** Only bank backend can settle
- **CORS Headers:** Permissive for MVP (restrict to whitelist in prod)
- **Origin Validation:** Check referer for widget iframe attacks

*Open source — use it wisely.*