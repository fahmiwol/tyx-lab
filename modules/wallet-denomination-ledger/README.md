# Wallet Denomination Ledger

**Problem:** Multi-currency wallets need immutable transaction history per denomination. Current balance computed from ledger (sum all TRANSFER in − out, MINT + received, etc.). Without ledger, balance can drift, reconciliation impossible.

**Solution:** Append-only ledger with transaction types:
- **TRANSFER_IN:** Received from another wallet
- **TRANSFER_OUT:** Sent to another wallet
- **MINT:** New coins created by issuer
- **BURN:** Removed from circulation
- **HOLD:** Reserved (pending withdrawal)
- **SETTLE:** Debit from hold

Each entry: { txId, walletId, denom, type, amount, balance, timestamp }

## Interface

```typescript
type TransactionType = 'TRANSFER_IN' | 'TRANSFER_OUT' | 'MINT' | 'BURN' | 'HOLD' | 'SETTLE';

interface LedgerEntry {
  txId: string;
  walletId: string;
  denom: Denomination;
  type: TransactionType;
  amount: number;
  balance: number;  // Running balance after this tx
  note?: string;
  timestamp: ISO8601;
}

async function postLedger(
  walletId: string,
  denom: Denomination,
  type: TransactionType,
  amount: number,
  note?: string
): Promise<LedgerEntry>;

async function getLedgerEntries(
  walletId: string,
  denom?: Denomination,
  limit?: number
): Promise<LedgerEntry[]>;

async function getBalance(
  walletId: string,
  denom: Denomination
): Promise<number>;  // Sum all entries for denom
```

## Usage

```typescript
// Transfer out
const tx = await postLedger('wallet_123', 'SILVER', 'TRANSFER_OUT', 50, 'Payment to merchant');
// { txId: 'tx_456', walletId, denom: 'SILVER', amount: -50, balance: 200, ... }

// Get ledger
const entries = await getLedgerEntries('wallet_123', 'SILVER');
// All SILVER transactions for this wallet

// Current balance
const balance = await getBalance('wallet_123', 'SILVER');  // 200
// Computed: previous balance - 50 (latest transfer)
```

## Key Patterns

- **Immutable entries:** Never update, only append (audit-safe)
- **Running balance:** Each entry includes post-transaction balance (fast read)
- **Type-based:** Filter by TRANSFER, MINT, BURN for reporting
- **Reconcilable:** Sum(amount) for each denom = currentBalance
- **Per-denom:** Separate ledger streams for each denomination

## Integration

- **Wallet Balance:** Query `getBalance(walletId, denom)` instead of storing
- **Audit Trail:** Entire history available for compliance
- **Reporting:** Group by type for income/expense breakdown
- **Settlement:** HOLD → SETTLE pair tracks pending→complete

## Reconciliation Query

```sql
SELECT denom, SUM(amount) as computed_balance
FROM wallet_denomination_ledger
WHERE wallet_id = 'wallet_123' AND type IN ('TRANSFER_IN', 'TRANSFER_OUT', 'MINT', 'BURN')
GROUP BY denom;
-- Compare against reported balance
```

*Open source — use it wisely.*