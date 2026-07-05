# Idempotent Payment Processing

Prevent duplicate transaction processing when payment webhooks retry (Midtrans, Stripe, etc.).

## Problem

Payment providers send webhooks with retry logic:
- Confirmation sent from Midtrans → User's server receives it → Creates transaction
- But user's server didn't ACK → Midtrans retries → Creates ANOTHER transaction
- Result: User credited twice from single payment

## Solution: Idempotency Keys

Every financial mutation uses an idempotency key (unique identifier tied to the external event):

```typescript
// Example: Midtrans webhook for order completion
async function handleMidtransNotification(payload: MidtransPayload) {
  const idempotencyKey = `midtrans_${payload.order_id}_${payload.transaction_id}`;

  // Check if we already processed this
  const existing = await db.transaction.findFirst({
    where: {
      payload: { idempotencyKey }  // Stored in JSON column
    }
  });

  if (existing) {
    // Already processed: return cached result (idempotent)
    return { success: true, txId: existing.id };
  }

  // First time: process mutation wrapped in transaction
  return db.$transaction(async (tx) => {
    // ... credit user ...
    const txRecord = await tx.transaction.create({
      data: {
        type: "TOPUP",
        toWalletId: userId,
        amount: BigInt(payload.gross_amount),
        payload: {
          orderId: payload.order_id,
          midtransId: payload.transaction_id,
          idempotencyKey,
          status: payload.transaction_status
        }
      }
    });

    return { success: true, txId: txRecord.id };
  });
}
```

## Schema Pattern

```sql
model Transaction {
  id            String  @id @default(cuid())
  -- ... fields ...
  payload       Json?   -- stores { idempotencyKey, ... }
  
  @@index([payload])  -- or use database-specific JSON index
}
```

## Idempotency Key Strategy

| Source | Key Format | Why |
|--------|-----------|-----|
| Midtrans | `midtrans_{orderId}_{transactionId}` | Combination of order + Midtrans reference |
| Stripe | `stripe_{paymentIntentId}_{clientSecret}` | Payment intent already handles this |
| Bank transfer | `bank_{bankCode}_{referenceNumber}_{date}` | Reference number should be unique per day |
| Manual topup | `manual_{adminUserId}_{timestamp}_{nonce}` | Admin + timestamp + random nonce |

Key property: **Must be deterministic for the same external event** (so retries produce same key).

## Implementation Checklist

- [x] Extract idempotency key from external payload
- [x] Query for existing transaction with same key
- [x] If found: return cached result (DO NOT process again)
- [x] If not found: wrap mutation in atomic transaction
- [x] Store idempotency key in `payload` JSON
- [x] Index the payload column for fast lookups (DB-specific)
- [x] Return same response format whether cached or fresh
- [x] Add logging: "Idempotent return for key={key}" vs "First-time processing"

## Why This Pattern?

1. **Webhooks are unreliable:** They retry if your server doesn't ACK fast
2. **Financial correctness:** Every external event maps to exactly one internal transaction
3. **Compliance:** Audit log shows idempotency key for traceability
4. **Performance:** Cached returns are instant (no recomputation)
5. **Simplicity:** No special idempotency service needed (database is source of truth)

## Variations

- **Stripe approach:** Use Stripe's built-in idempotency (`Idempotency-Key` header on API calls)
- **RabbitMQ:** Subscribe to webhook queue with dead-letter handling
- **Distributed lock:** Use Redis to prevent race conditions on first-time processing
- **Timeout strategy:** If mutation takes >30s, return status 202 (Accepted) to webhook provider

*Open source — use it wisely.*
