# Credit Metering System: Real-Time Usage Tracking & Enforcement

**Version:** 1.0.0 | **Category:** Infra | **Status:** stable

## Overview

A production system for tracking agent/user service consumption in real-time, enforcing quotas, and preventing over-spend. Essential for multi-tenant SaaS, agent marketplaces, and freemium products.

## Architecture Overview

API Request -> Metering Middleware -> Check Balance
If Insufficient: Deny (402 error)
If Sufficient: Execute Service -> Deduct Credits -> Log Transaction -> Update Cache

## Layer 1: Real-Time Balance Cache (Redis)

Redis gives O(1) reads/writes. DB queries on every API call = bottleneck.

Cache structure:
- Key: balance:{agent_id}
- TTL: 5 minutes
- Atomic deduction via Lua script

## Layer 2: Metering Middleware (FastAPI)

Intercept every request, check credits before execution:

1. Extract agent_id from request header
2. Look up service cost from SERVICE_COSTS map
3. Check balance in Redis cache
4. If insufficient: return 402 Payment Required
5. If sufficient: pre-deduct (optimistic locking)
6. Execute service
7. If service fails: refund credits
8. Log transaction to ledger
9. Invalidate cache

## Layer 3: Quota Enforcement (Rate Limiting)

Prevent abuse with time-based quotas:
- Daily: 100K credits/day
- Hourly: 5K credits/hour
- Per minute: 100 credits/min

Check before each request, increment counter, set TTL.

## Layer 4: Transaction Logging (Ledger)

Every deduction logged to PostgreSQL:
- timestamp
- agent_id
- service name
- cost_credits
- status (success/refunded/failed)
- request_id

Index: (agent_id, timestamp DESC) for fast queries.

## Layer 5: Daily Reconciliation

Batch job at 00:00 UTC:
1. Sum all ledger transactions per agent
2. Compare to Redis cache
3. If mismatch > $0.01: log warning, correct cache
4. Create audit record

## Pricing Models

Model A: Pay-Per-Use
- image: $0.50
- video: $5.00/min
- data: $2.00/1K rows

Model B: Tiered
- 0-10K: $0.01 per credit
- 10K-100K: $0.008 per credit
- 100K+: $0.005 per credit

Model C: Subscription + Overage
- Free: 1K/month
- Pro $19: 10K + $0.01 overage
- Enterprise $199: 100K + custom

## Error Handling

Always refund on failure:
- Service error -> refund
- Exception -> refund
- Concurrent deduction race -> retry or fail gracefully

*Open source — use it wisely.*
