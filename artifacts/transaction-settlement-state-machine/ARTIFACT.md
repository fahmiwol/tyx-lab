# Transaction Settlement State Machine

Canonical state flow for settlement workflows: PENDING → AUTHORIZED → POSTED → RECONCILED. Defines valid transitions, error recovery paths (RETURNED, FAILED), and deadletter handling. Reference for implementing fault-tolerant payment pipelines.

## State Diagram

```
                    ┌─────────────────┐
                    │   INITIATED     │
                    └────────┬────────┘
                             │
                   submit to gateway
                             │
                             ▼
                    ┌─────────────────┐
                    │  PENDING_AUTH   │
                    └────────┬────────┘
                      ▲      │      ▲
                  retry│      │      │auth timeout
                      │      │      │(pending >30s)
                      │      ▼      │
                    ┌─────────────────┐
                    │  AUTHORIZED     │◄─────── gateway callback
                    └────────┬────────┘
                             │
                   post to ledger
                             │
                             ▼
                    ┌─────────────────┐
                    │    POSTED       │
                    └────────┬────────┘
                             │
                   reconcile & settle
                             │
                             ▼
                    ┌─────────────────┐
                    │ RECONCILED      │
                    └─────────────────┘
                    (immutable end state)

Error paths:
PENDING_AUTH → FAILED (gateway rejection)
AUTHORIZED → RETURNED (insufficient balance, frozen account)
POSTED → FAILED (reconciliation error, manual intervention)
```

## States

### INITIATED
- Transition: Request received and validated
- Duration: < 100ms
- Next: PENDING_AUTH
- Rollback: Can cancel without ledger impact

### PENDING_AUTH
- Transition: Request submitted to payment gateway
- Duration: 5-30s (configurable timeout)
- Next: AUTHORIZED or FAILED
- Monitoring: If no callback after 30s → mark as PENDING_TIMEOUT, move to DEADLETTER
- Rollback: Yes, but must track in gateway

### AUTHORIZED
- Transition: Gateway confirmed payment reserved
- Duration: < 5s until POSTED
- Next: POSTED or RETURNED
- Notes: Balance is held but not yet deducted
- Rollback: Release hold (if supported by gateway)

### POSTED
- Transition: Balance deducted from wallet, transaction recorded in ledger
- Duration: Indefinite until reconciliation
- Next: RECONCILED or FAILED
- Rollback: VERY DIFFICULT — creates audit gap
- Notes: This is the "point of no return" for most systems

### RECONCILED
- Transition: Matched against bank feed / payment gateway statement
- Duration: Immediate
- Next: None (terminal state)
- Rollback: IMPOSSIBLE — would require reversal transaction
- Notes: Final, immutable state

### FAILED
- Transition: Payment rejected by gateway or local validation
- Duration: N/A
- Next: None (terminal state)
- Reason: Insufficient funds, card declined, fraud hold, etc.
- Rollback: N/A (never charged)

### RETURNED
- Transition: Post-authorization failure (e.g., insufficient balance after AUTHORIZED)
- Duration: Flagged during POSTED → reconciliation
- Next: None (terminal state)
- Action: Credit original payment method
- Notes: Treated as reversed transaction in ledger

### PENDING_TIMEOUT
- Transition: No callback from gateway after 30s
- Duration: Until manual review
- Next: DEADLETTER or AUTHORIZED (if callback arrives)
- Action: Escalate to ops team
- Notes: Transient state — awaiting human decision

### DEADLETTER
- Transition: Unrecoverable error or manual escalation
- Duration: Indefinite
- Next: Manual intervention required
- Action: Human review, determine if charge went through, post correction
- Notes: Safety valve for edge cases

## Transition Matrix

```
FROM            | TO                  | Condition
─────────────────┼─────────────────────┼──────────────────────────
INITIATED       | PENDING_AUTH        | Validation success
INITIATED       | FAILED              | Validation error
PENDING_AUTH    | AUTHORIZED          | Gateway approved
PENDING_AUTH    | FAILED              | Gateway rejected
PENDING_AUTH    | PENDING_TIMEOUT     | Timeout after 30s
AUTHORIZED      | POSTED              | Balance deducted
AUTHORIZED      | RETURNED            | Local validation fail
POSTED          | RECONCILED          | Statement match
POSTED          | FAILED              | Reconciliation error
PENDING_TIMEOUT | AUTHORIZED          | Callback arrived (late)
PENDING_TIMEOUT | DEADLETTER          | No callback + manual escalation
```

## Idempotency & Retries

All transitions are idempotent:

```
GET /api/payment/status/:transactionId

Response:
{
  "transaction_id": "tx_123",
  "state": "AUTHORIZED",
  "posted_at": null,
  "reconciled_at": null,
  "can_retry": true,
  "error": null
}
```

Retrying:
- INITIATED → safe, retry immediately
- PENDING_AUTH → safe, retry with exponential backoff (1s, 2s, 4s)
- AUTHORIZED → safe, proceed to POST (idempotency key in use)
- POSTED → safe if idempotency key still valid
- RECONCILED, FAILED, RETURNED, DEADLETTER → terminal, do NOT retry

## Implementation Checklist

- [ ] Database schema with `state` and `state_changed_at` timestamp
- [ ] Async job for PENDING_AUTH timeout detection (every 5s)
- [ ] Webhook handler for gateway callbacks (AUTHORIZED transition)
- [ ] Reconciliation job (nightly or continuous) for POSTED → RECONCILED
- [ ] Deadletter queue for FAILED and PENDING_TIMEOUT cases
- [ ] Logging at each transition (audit trail)
- [ ] Status API for external polling
- [ ] Rollback procedures documented per state
- [ ] Monitoring alerts for stuck transactions (PENDING_AUTH > 60s)
- [ ] Manual override UI for DEADLETTER cases

## Recovery Scenarios

### "Charge went through but callback didn't arrive"
- State: PENDING_TIMEOUT
- Detection: Manual inquiry from customer
- Fix: Query gateway for transaction status → find matching posted charge → mark as AUTHORIZED → POST → RECONCILED

### "Balance deducted twice"
- State: POSTED (duplicate)
- Detection: Ledger reconciliation or customer report
- Fix: Audit trail shows two POSTED events with same idempotency key → revert one, issue correction

### "Transaction stuck in PENDING_AUTH for 2 hours"
- State: PENDING_AUTH
- Detection: Monitoring alert
- Fix: Check gateway status → if no activity after 1h, escalate to DEADLETTER → manual review

Open source — use it wisely.
