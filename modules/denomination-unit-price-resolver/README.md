# Denomination Unit Price Resolver

**Problem:** Convert token quantities to fiat (IDR) for display, fees, and settlement. Prices fluctuate and historical prices needed for audit trail.

**Solution:** Versioned lookup table:
- GOLD → Rp 10.000/coin
- SILVER → Rp 8.000/coin
- BRONZE → Rp 5.000/coin
- DIAMOND → Rp 1.000/coin (gamification token)

Each entry includes effectiveAt + nextChange timestamps for point-in-time settlement.

## Interface

```typescript
type Denomination = 'GOLD' | 'SILVER' | 'BRONZE' | 'DIAMOND';

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
const prices = await getPrices(['SILVER', 'BRONZE']);
const totalIDR = 50 * prices.SILVER + 100 * prices.BRONZE; // Rp 900.000

// Historical (for audit trail)
const histPrice = await getPriceForDenom('SILVER', '2026-06-01T00:00:00Z');
// May return different rate if changed since June 1
```

## Key Patterns

- **Immutable snapshots:** Each price change creates new record (audit trail)
- **Effective dating:** nextChange alerts clients to refresh cache
- **Batch lookups:** More efficient than N calls
- **Timezone-safe:** Always ISO8601, UTC

*Open source — use it wisely.*