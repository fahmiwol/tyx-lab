# Multi-Denomination Wallet Balance

**Problem:** Wallets hold multiple token types (EMAS, PERAK, PERUNGGU, BERLIAN) simultaneously. Balance queries need to atomically return multi-currency state plus real-time fiat equivalent for display/settlement.

**Solution:** Normalized wallet model that:
1. Stores balances as `Record<Denomination, number>` — atomic update to prevent partial reads
2. Exposes `totalIDR` computed from unit-price table (e.g., PERAK=Rp8000, PERUNGGU=Rp5000)
3. Returns `lastUpdated` timestamp for cache validation
4. Validates balance against ledger sum (TRANSFER in − out, MINT + received, BURN − removed)

## Interface

```typescript
interface WalletData {
  walletId: string;
  userId: string;
  balances: {
    EMAS: number;
    PERAK: number;
    PERUNGGU: number;
    BERLIAN: number;
  };
  totalIDR: number;
  lastUpdated?: string;
}

async function getWalletBalance(walletId: string): Promise<WalletData | null>
```

## Usage

```typescript
const wallet = await getWalletBalance('wallet_abc123');
// { walletId: 'wallet_abc123', balances: { EMAS: 5, PERAK: 120, ... }, totalIDR: 1010000 }

// Use for display:
console.log(`Saldo PERAK: ${wallet.balances.PERAK} koin (~Rp ${wallet.balances.PERAK * 8000})`);

// Use for settlement pre-check:
if (wallet.balances.PERAK < amountNeeded) throw new Error('Insufficient balance');
```

## Integration

- **Checkout UI:** Display totalIDR to buyer
- **Transfer validation:** Pre-flight check on balance[denom]
- **Settlement:** Atomically freeze then debit
- **Reporting:** totalIDR aggregation across all wallets

## Key Patterns

- **Atomic reads:** All denoms fetched in single query (no race between PERAK read + BERLIAN read)
- **Lazy IDR computation:** Calculate only on demand (expensive if done per-transaction)
- **Cache-aware:** Client checks lastUpdated before re-fetch
- **Ledger-verifiable:** Can be reconciled by summing all ledger entries per denom

*Open source — use it wisely.*
