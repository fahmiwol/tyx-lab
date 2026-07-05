# Currency Formatter & Conversion

Format IDR and USD prices; sync rate from DB. Display-only USD for international buyers; all payments in IDR (Midtrans, etc.).

## Why

- **Localization**: Show prices in local currency (IDR) and USD
- **Rate management**: Store exchange rate in DB, update without code redeploy
- **UI helpers**: Pre-formatted strings for common display patterns
- **Payment clarity**: Charge in IDR, display USD equivalent

## Usage

```typescript
import {
  getUsdRate,
  idrToUsd,
  idrDisplayPrice,
  usdDisplayPrice,
  fullPriceLabel,
  setUsdRate,
} from '@/lib/currency-formatter';

const rate = getUsdRate(); // 16000 (from DB or default)

// Convert
const usd = idrToUsd(160000, rate); // "10.00"

// Display
console.log(idrDisplayPrice(160000));        // "Rp 160.000"
console.log(usdDisplayPrice(160000, rate));  // "$10.00"
console.log(fullPriceLabel(160000, rate));   // "Rp 160.000 (~$10.00)"

// Admin: update rate
setUsdRate(17000);
```

## Formatting Examples

```typescript
const rate = getUsdRate();

// Small amount
fullPriceLabel(50000, rate);  // "Rp 50.000 (~$3.13)"

// Large amount
fullPriceLabel(2000000, rate); // "Rp 2.000.000 (~$125.00)"

// Zero-padded cents
idrToUsd(10001, rate); // "0.62" (always 2 decimals)
```

## Database Storage

```sql
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Initialize
INSERT INTO site_settings (key, value) VALUES ('usd_rate', '16000');
```

## API Route Example

```typescript
import { fullPriceLabel, getUsdRate } from '@/lib/currency-formatter';

export async function GET() {
  const products = [
    { id: 1, name: 'Coffee Mug', priceIdr: 150000 },
    { id: 2, name: 'T-Shirt', priceIdr: 300000 },
  ];

  const rate = getUsdRate();

  return Response.json(
    products.map(p => ({
      ...p,
      display: fullPriceLabel(p.priceIdr, rate),
    }))
  );
}

// Output:
// [
//   { id: 1, name: 'Coffee Mug', priceIdr: 150000, display: 'Rp 150.000 (~$9.38)' },
//   { id: 2, name: 'T-Shirt', priceIdr: 300000, display: 'Rp 300.000 (~$18.75)' },
// ]
```

## Front-End Component

```tsx
import { fullPriceLabel, getUsdRate } from '@/lib/currency-formatter';

export function ProductCard({ product }) {
  const rate = getUsdRate();
  const priceDisplay = fullPriceLabel(product.priceIdr, rate);

  return (
    <div className="card">
      <h3>{product.name}</h3>
      <p className="price">{priceDisplay}</p>
      <button>Buy</button>
    </div>
  );
}
```

## Rate Update Flow

1. Admin visits settings page
2. Sees current rate from `getUsdRate()`
3. Enters new rate (e.g., 17000)
4. Calls `setUsdRate(17000)`
5. All new prices use new rate immediately (no cache invalidation needed)

```typescript
// Admin API route
export async function POST(request: Request) {
  // Verify admin...
  const { newRate } = await request.json();

  if (!setUsdRate(newRate)) {
    return Response.json({ error: 'Invalid rate' }, { status: 400 });
  }

  return Response.json({ ok: true, newRate });
}
```

## Edge Cases

- **Zero rate**: Rejected (returns default)
- **Negative rate**: Rejected
- **Non-numeric rate**: Falls back to DEFAULT_RATE
- **DB unreachable**: Uses DEFAULT_RATE (16000)
- **Very large amounts**: Still formats correctly (no overflow)

## Locales

- **IDR**: Uses `id-ID` locale (thousands separator: `.`, decimal: `,`)
- **USD**: US format (thousands: `,`, decimal: `.`)

## Related Modules

- `tiered-quota-resolver`: Uses rates for coin pricing
- `aes-256-gcm-secret`: Can encrypt payment API keys

*Open source — use it wisely.*
