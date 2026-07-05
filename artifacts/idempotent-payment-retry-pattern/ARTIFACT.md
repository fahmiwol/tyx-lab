# Idempotent Payment Retry Pattern

Reference design for payment retry logic that prevents duplicate charges. Uses idempotency keys (UUID-based), response caching, and state machine for in-flight transaction handling. Covers network failures and timeout scenarios.

## Problem

Payment processing is inherently unreliable:
- Network timeouts during POST → unclear if charge went through
- Client retries the same request → potential duplicate charge
- No way to safely replay a failed request

## Solution

### Idempotency Key

Every payment request includes a unique, immutable `idempotency_key`:

```
POST /api/payment/initiate
{
  "idempotency_key": "uuid-1234-5678-90ab-cdef",
  "wallet_id": "wallet_123",
  "amount": 100,
  "denomination": "SILVER"
}
```

The server stores this key. Retry with the SAME key → returns cached result (no duplicate charge).

### Request-Response Cache

```
Cache[idempotency_key] = {
  status: "completed",
  response: { transaction_id: "tx_456", ... },
  created_at: 2026-07-05T14:30:00Z
}
```

Retry handling:
1. Receive request with `idempotency_key`
2. Check cache: if found → return cached response (HTTP 200, NOT 409)
3. Not found → process payment, store result, return

### State Machine

Payment states:
- `INITIATED` — request received, awaiting authorization
- `AUTHORIZED` — payment authorized by payment gateway
- `POSTED` — balance deducted from wallet
- `COMPLETED` — final state, transaction immutable
- `FAILED` — payment rejected, rollback executed
- `PENDING_RETRY` — transient state for timeout recovery

Valid transitions:
```
INITIATED → AUTHORIZED → POSTED → COMPLETED
INITIATED → FAILED
AUTHORIZED → FAILED
PENDING_RETRY → (retry) → AUTHORIZED or FAILED
```

### Retry Algorithm

```
max_retries = 3
retry_delay = 1s (exponential backoff: 1s, 2s, 4s)

for attempt in 0..max_retries:
  try:
    response = POST /api/payment/initiate with idempotency_key
    if response.status in [200, 201, 409]:
      return response
    if response.status >= 500:
      if attempt < max_retries:
        wait(retry_delay * 2^attempt)
        continue
  catch TimeoutException:
    if attempt < max_retries:
      wait(retry_delay * 2^attempt)
      continue
    else:
      throw
```

### Database Schema

```sql
CREATE TABLE payment_idempotency (
  idempotency_key VARCHAR(64) PRIMARY KEY,
  request_hash VARCHAR(64),
  response_json JSONB,
  state VARCHAR(32),
  created_at TIMESTAMP,
  expires_at TIMESTAMP  -- cleanup after 24h
);

CREATE INDEX ON payment_idempotency(expires_at);
```

### Error Handling

**Client receives 409 Conflict** → Payment already processed (same key exists)
- DO NOT retry again
- Use cached response
- Treat as success (payment went through)

**Client receives 5xx (transient)** → Retry with same key
- Server will return cached response if payment already posted
- OR process new request if key wasn't seen before

**Timeout during POST** → Client may safely retry
- Idempotency key ensures no duplicate charge
- Server decides based on key presence

## Benefits

- ✅ No duplicate charges on retry
- ✅ Safe client-side retry logic
- ✅ Covers network failures, timeouts, crashes
- ✅ Works with any payment gateway
- ✅ Zero external dependencies

## Limitations

- Cache must persist (database, not in-memory)
- Idempotency key must be unique per payment attempt
- Doesn't solve authorization failures (invalid card, insufficient funds)
- Client must supply the key (not auto-generated)

Open source — use it wisely.
