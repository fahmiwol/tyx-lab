# Append-Only Audit Log Pattern

Immutable audit trail for compliance, security & debugging.

## Features

- **Append-only:** No updates/deletes — only inserts
- **Denormalized:** Username + metadata cached to preserve history if user deleted
- **Request metadata:** IP, User-Agent auto-captured from HTTP layer
- **Dual-track:** User actions + Admin actions in separate tables
- **Soft-fail:** Audit failures never crash the request (logged to console, ops must monitor)
- **Queryable:** Indexed by userId/action/createdAt for fast audit trail retrieval

## Schema

```sql
model UserAuditLog {
  id        String   @id @default(cuid())
  userId    String?  -- nullable: user might be deleted
  username  String   -- denormalized: frozen at time of action
  action    String   -- e.g., "user.login", "user.transfer", "user.withdraw"
  amount    BigInt?  -- optional: only for transactions
  denom     String?  -- optional: currency/coin denomination
  txId      String?  -- optional: link to transaction.id
  payload   Json?    -- structured metadata
  ip        String?
  userAgent String?
  createdAt DateTime @default(now())

  @@index([userId])
  @@index([action])
  @@index([createdAt])
}

model AdminAuditLog {
  id          String   @id @default(cuid())
  adminUserId String?  -- nullable: allows system/cron actions
  adminUser   AdminUser? @relation(...)
  username    String   -- denormalized: frozen at time of action
  action      String   -- e.g., "withdrawal.approve", "user.suspend"
  targetType  String?  -- e.g., "transaction", "wallet", "user"
  targetId    String?
  payload     Json?    -- before/after snapshot or metadata
  ip          String?
  userAgent   String?
  createdAt   DateTime @default(now())

  @@index([adminUserId])
  @@index([action])
  @@index([targetType, targetId])
  @@index([createdAt])
}
```

## Usage Example

```typescript
// from a production ledger service src/lib/audit.ts
import { recordUserAudit, auditMetaFromRequest } from "./audit";

// In a route handler
export async function POST(req: FastifyRequest) {
  const { ip, userAgent } = auditMetaFromRequest(req);
  
  try {
    // ... business logic ...
    await recordUserAudit({
      userId: "user_123",
      username: "fahmi",  // cache this
      action: "user.transfer",
      amount: 500,
      denom: "SILVER",
      txId: "tx_abc",
      payload: { from: "wallet_1", to: "wallet_2" },
      ip,
      userAgent,
    });
  } catch (e) {
    // Audit failure does NOT crash the request
    console.error("[AUDIT FAIL]", e.message);
  }
}
```

## Why This Pattern?

1. **Immutability:** Prevents tampering — critical for fintech
2. **Compliance:** Non-repudiation for regulatory audits
3. **Denormalization:** Audits remain readable even if user deleted
4. **Soft failures:** Operations never degrade user experience
5. **Performance:** Separate tables + indexes allow parallel reads

## Variations

- **Event sourcing:** Append user/admin actions as separate event stream
- **Time-series DB:** For high-volume logs, consider TimescaleDB, ClickHouse
- **Retention policy:** Add `deletedAt` for GDPR compliance + archival jobs
- **Encryption:** Store sensitive payloads encrypted at rest

*Open source — use it wisely.*