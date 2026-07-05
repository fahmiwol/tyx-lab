# Double-Entry Ledger Implementation Logic

## Core Principles

### 1. Atomicity via Database Transactions
Every operation must be wrapped in `prisma.$transaction()`:

```typescript
prisma.$transaction(async (tx) => {
  // All queries here auto-rollback if ANY fails
  // This prevents partial transfers (sender debited but receiver not credited)
})
```

Why? Financial systems have no "half-state"—either all steps succeed or none.

### 2. BigInt for Money
Use `BigInt` for all amounts (never `number`):

```typescript
// WRONG
amount: 100.50  // ❌ floating point precision loss

// RIGHT
amount: BigInt(10050)  // Store as minor units (cents/satoshis)
```

Rationale: Binary floating-point cannot represent decimal exactly. Even `0.1 + 0.2 !== 0.3` in JavaScript.

### 3. Balance Denormalization
Maintain a `WalletBalance` table SEPARATE from `Transaction` log:

```sql
-- Query pattern 1: "What's my balance?" (frequent, simple)
SELECT amount FROM wallet_balance 
WHERE walletId = ? AND denomination = 'SILVER'

-- Query pattern 2: "Show my transactions" (audit, less frequent)
SELECT * FROM transactions 
WHERE fromWalletId = ? OR toWalletId = ? 
ORDER BY createdAt DESC
```

Trade-off: Denormalization adds complexity (must keep both tables in sync) but makes user-facing queries fast. Never let users wait for a full transaction sum.

### 4. Conversion Rules as Config
Store allowed conversions + fees in a central place:

```typescript
export const CONVERSION_RULES: Record<string, { ratio: number; allowed: boolean; fee?: number }> = {
  "GOLD->SILVER": { ratio: 1, allowed: true },
  "SILVER->BRONZE": { ratio: 1, allowed: true, fee: 3000 },  // IDR margin
  "BRONZE->SILVER": { ratio: 0, allowed: false },  // No downgrade
  "DIAMOND->*": { ratio: 0, allowed: false },  // Rewards never convert
};
```

Why? Changing fees requires a code deploy + database migration without this abstraction. With config, you can (eventually) query/update it from an admin dashboard.

### 5. State Machine for Transaction Status

```
PENDING ──> COMPLETED ──> [permanent]
  ↓
FAILED ──> [investigation/manual reversal]

OR

COMPLETED ──> REVERSED ──> [audit logged]
```

Rules:
- Only PENDING transactions should be allowed to transition
- A COMPLETED transaction that needs reversal creates a new REVERSE transaction (never UPDATE)
- FAILED remains permanent (no auto-retry)

### 6. Null Semantics for One-Sided Ops
For MINT/REWARD/WITHDRAW operations:

```typescript
// MINT: create value from nothing
Transaction {
  fromWalletId: null,  // nobody sent it
  toWalletId: wallet.id,
  type: "MINT",
  amount: 1000
}

// WITHDRAW: remove value to external system
Transaction {
  fromWalletId: wallet.id,
  toWalletId: null,  // nobody receives it (user's external bank)
  type: "WITHDRAW",
  amount: 1000
}
```

Benefit: Queries like `SELECT * WHERE fromWalletId = null AND type = 'MINT'` reveal all value injected into system.

## Reconciliation Algorithm

Periodically verify: Σ (debit from X) = Σ (credit to X) across all wallets.

```sql
-- Check: total minted = total in all wallets + total withdrawn
SELECT
  SUM(CASE WHEN type='MINT' THEN amount ELSE 0 END) as total_minted,
  SUM(CASE WHEN type='WITHDRAW' THEN amount ELSE 0 END) as total_withdrawn,
  (SELECT SUM(amount) FROM wallet_balance WHERE denomination='SILVER') as in_wallets
FROM transactions;

-- Should be: total_minted - total_withdrawn - in_wallets = 0 (or accounted margin in hub)
```

## Conversion with Margin Flow

```
User: "Convert 100 SILVER → BRONZE"

Step 1: CONVERSION_RULES["SILVER->BRONZE"] = { ratio: 1, fee: 3000 }
Step 2: Debit user 100 SILVER
Step 3: Credit user 100 BRONZE (no fee deducted from user; margin is platform revenue)
Step 4: Create TWO ledger records:
  - User transfer: SILVER -100 → BRONZE +100
  - Platform revenue: margin +3000 IDR → platform account
Step 5: Notify accounting: Revenue recorded
```

Why separate records? Compliance requires transparent margin tracking.

## Idempotency for Critical Mutations

For payment flows (e.g., webhook from Midtrans confirming top-up):

```typescript
export async function topupCompleted(
  userId: string,
  orderId: string,
  amount: number,
  idempotencyKey: string
): Promise<{ txId: string }> {
  // Check: did we already process this idempotency key?
  const existing = await prisma.transaction.findFirst({
    where: {
      payload: { idempotencyKey },  // stored in JSON
      type: "TRANSFER"
    }
  });
  if (existing) return { txId: existing.id };  // Idempotent return

  // First time: process normally
  return prisma.$transaction(async (tx) => {
    // ... credit wallet ...
    await tx.transaction.create({
      data: {
        type: "TRANSFER",
        toWalletId,
        amount: BigInt(amount),
        payload: { orderId, idempotencyKey }
      }
    });
  });
}
```

Rationale: Webhooks can retry (Midtrans might send confirmation 3x). Don't create 3 transactions.

*Open source — use it wisely.*