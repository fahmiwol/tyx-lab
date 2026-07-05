# Denomination Unit Price Resolver

**Problem:** Convert token quantities to fiat (IDR) for display, fees, and settlement. Prices fluctuate and historical prices needed for audit trail.

**Solution:** Versioned lookup table:
- EMAS → Rp 10.000/coin
- PERAK → Rp 8.000/coin
- PERUNGGU → Rp 5.000/coin
- BERLIAN → Rp 1.000/coin (gamification token)

Each entry includes effectiveAt + nextChange timestamps for point-in-time settlement.

## Interface

```typescript
type Denomination = 'EMAS' | 'PERAK' | 'PERUNGGU' | 'BERLIAN';

async function getPriceForDenom(
  denom: Denomination,
  atTimestamp?: ISO8601
): Promise<{ denom, idr, effectiveAt, nextChange }>;

// Or batch:
async function getPrices(
  denoms: Denomination[],
  atTimestamp?: ISO8601
): Promise<Record<Denomination, number>>;
```

## Usage

```typescript
// Current price
const prices = await getPrices(['PERAK', 'PERUNGGU']);
const totalIDR = 50 * prices.PERAK + 100 * prices.PERUNGGU; // Rp 900.000

// Historical (for audit trail)
const histPrice = await getPriceForDenom('PERAK', '2026-06-01T00:00:00Z');
// May return different rate if changed since June 1
```

## Key Patterns

- **Immutable snapshots:** Each price change creates new record (audit trail)
- **Effective dating:** nextChange alerts clients to refresh cache
- **Batch lookups:** More efficient than N calls
- **Timezone-safe:** Always ISO8601, UTC

*Open source — use it wisely.*
