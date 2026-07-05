# Double-Entry Ledger Pattern

Immutable transaction ledger for fintech: track flows between wallets, conversions, fees, and audit compliance.

## Features

- **Double-entry:** Every transaction has FROM and TO (even one-sided operations use NULL)
- **State machine:** Transactions progress through PENDING → COMPLETED or FAILED
- **Type taxonomy:** MINT, TRANSFER, CONVERT, REWARD, WITHDRAW
- **Denormalized balances:** WalletBalance table for O(1) balance queries
- **Coin-level tracking:** Individual unit history via CoinHistory
- **Conversion rules:** Configurable conversion matrix (e.g., Perak → Perunggu with margin)

## Schema

```sql
enum TransactionType {
  MINT         -- currency creation
  TRANSFER     -- P2P or flow
  CONVERT      -- denomination conversion with fee
  REWARD       -- earned from user activity
  WITHDRAW     -- exit to external system
}

enum TransactionStatus {
  PENDING      -- awaiting processing
  COMPLETED    -- settled
  FAILED       -- rejected
  REVERSED     -- user/admin rollback
}

model Transaction {
  id            String  @id @default(cuid())
  type          TransactionType
  status        TransactionStatus @default(PENDING)
  
  fromWalletId  String?
  toWalletId    String?
  fromDenom     String?  -- e.g., "PERAK"
  toDenom       String?  -- e.g., "PERUNGGU"
  amount        BigInt   -- in minor units (cents/satoshis)
  
  fee           BigInt   @default(0)  -- margin/fee captured
  note          String?
  payload       Json?    -- metadata: orderId, reason, reference
  
  createdAt     DateTime @default(now())
  completedAt   DateTime?
  
  @@index([fromWalletId, status, createdAt])
  @@index([toWalletId, status, createdAt])
  @@index([type, status])
}

model WalletBalance {
  id            String  @id @default(cuid())
  walletId      String
  denomination  String  -- "EMAS", "PERAK", "PERUNGGU", "BERLIAN"
  amount        BigInt  @default(0)
  
  @@unique([walletId, denomination])
  @@index([walletId])
}

model CoinHistory {
  id            String  @id @default(cuid())
  coinId        String
  event         String  -- "MINTED", "TRANSFERRED", "USED", "RETURNED"
  
  fromWalletId  String?
  toWalletId    String?
  note          String?
  
  createdAt     DateTime @default(now())
  
  @@index([coinId])
  @@index([event, createdAt])
}
```

## Usage Example

### Simple P2P Transfer

```typescript
async function transferP2P(
  fromUserId: string,
  toUserId: string,
  amount: number
): Promise<{ txId: string }> {
  return prisma.$transaction(async (tx) => {
    // 1. Check balance
    const senderBal = await tx.walletBalance.findUnique({
      where: {
        walletId_denomination: {
          walletId: sender.id,
          denomination: "PERAK"
        }
      }
    });
    if (senderBal.amount < amount) {
      throw new Error("Insufficient balance");
    }

    // 2. Debit sender
    await tx.walletBalance.update({
      where: { walletId_denomination: {...} },
      data: { amount: { decrement: BigInt(amount) } }
    });

    // 3. Credit receiver
    await tx.walletBalance.upsert({
      where: { walletId_denomination: {...} },
      create: { walletId: toWallet.id, denomination: "PERUNGGU", amount: BigInt(amount) },
      update: { amount: { increment: BigInt(amount) } }
    });

    // 4. Create ledger record
    const txRecord = await tx.transaction.create({
      data: {
        type: "TRANSFER",
        status: "COMPLETED",
        fromWalletId: fromWallet.id,
        toWalletId: toWallet.id,
        fromDenom: "PERAK",
        toDenom: "PERUNGGU",
        amount: BigInt(amount),
        note: `P2P transfer ${fromUserId}→${toUserId}`
      }
    });

    return { txId: txRecord.id };
  });
}
```

### Conversion with Fee

```typescript
// CONVERSION_RULES: configurable matrix
const CONVERSION_RULES = {
  "EMAS->PERAK": { ratio: 1, allowed: true },
  "PERAK->PERUNGGU": { ratio: 1, allowed: true, fee: 3000 }  // IDR margin
};

async function convertCoins(userId: string, fromDenom: string, toDenom: string, amount: number) {
  const rule = CONVERSION_RULES[`${fromDenom}->${toDenom}`];
  if (!rule?.allowed) throw new Error("Conversion not allowed");

  const received = amount * rule.ratio;  // e.g., 1:1
  const feeIdr = rule.fee || 0;

  return prisma.$transaction(async (tx) => {
    // Debit sender
    await tx.walletBalance.update({
      where: { walletId_denomination: { walletId, denomination: fromDenom } },
      data: { amount: { decrement: BigInt(amount) } }
    });

    // Credit receiver (less margin)
    await tx.walletBalance.update({
      where: { walletId_denomination: { walletId, denomination: toDenom } },
      data: { amount: { increment: BigInt(received) } }
    });

    // Ledger
    await tx.transaction.create({
      data: {
        type: "CONVERT",
        status: "COMPLETED",
        fromWalletId: walletId,
        toWalletId: walletId,
        fromDenom,
        toDenom,
        amount: BigInt(amount),
        fee: BigInt(feeIdr),
        note: `Conversion ${amount} ${fromDenom} → ${received} ${toDenom}, margin: IDR${feeIdr}`
      }
    });
  });
}
```

## Why This Pattern?

1. **Reconciliation:** Sum all debits = sum all credits (always balanced)
2. **Audit trail:** Every transaction immutable and queryable
3. **Compliance:** No ambiguous partial states (Prisma transaction wraps all-or-nothing)
4. **Fee transparency:** Margin/fee captured separately for revenue analytics
5. **Conversion flexibility:** Centralized rules engine (no hardcoded ratios in UI)
6. **Coin-level genealogy:** CoinHistory tracks individual unit journey through wallets

## Indexing for Performance

```sql
-- Fast balance lookups (most common)
walletBalance_idx: (walletId, denomination)

-- Audit timeline by wallet
transaction_from_idx: (fromWalletId, status, createdAt DESC)
transaction_to_idx: (toWalletId, status, createdAt DESC)

-- Compliance queries (e.g., all withdrawals)
transaction_type_idx: (type, status, createdAt DESC)
```

*Open source — use it wisely.*
