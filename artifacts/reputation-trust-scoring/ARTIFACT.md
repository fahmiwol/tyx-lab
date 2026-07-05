# Reputation & Trust Scoring: Multi-Signal Agent Credibility Framework

**Version:** 1.0.0 | **Category:** AI | **Status:** stable

## Overview

A framework for scoring agent trustworthiness based on multi-dimensional signals (task completion rate, feedback quality, fraud likelihood, financial health). Used to determine service pricing, access levels, and priority queue placement in agent ecosystems.

## Signal Types

### Signal 1: Task Completion Rate
```
completion_rate = completed_tasks / total_tasks_assigned
Target: >= 0.95 (agents should complete 95%+ of assigned work)
Weight: 30%
```

### Signal 2: Quality Feedback
```
quality_score = avg(ratings) from tasks
Range: 1.0 (terrible) - 5.0 (excellent)
Target: >= 4.0
Weight: 30%
```

### Signal 3: Fraud/Abuse Detection
```
fraud_score = sum of violations:
- Rate limit exceeded: +0.1
- Refund rate > 10%: +0.2
- Repeated failed tasks: +0.15
- Balance gone negative (attempted double-spend): +0.3
- Blacklist match (known bad actor): +1.0

fraud_score clamped to [0.0, 1.0]
Target: < 0.1 (minimal abuse)
Weight: 25%
```

### Signal 4: Financial Health
```
financial_health = (current_balance / avg_weekly_spend)
Range: 0.0 - 5.0
- < 1.0 = high risk (could default)
- 1.0-3.0 = healthy
- > 3.0 = very healthy

Target: >= 2.0
Weight: 15%
```

## Trust Score Formula

```
trust_score = (
    0.30 * completion_rate +
    0.30 * (quality_score / 5.0) +  // normalize to 0-1
    0.25 * (1.0 - fraud_score) +     // invert fraud (low fraud = high trust)
    0.15 * min(financial_health / 3.0, 1.0)  // normalize to 0-1
)

trust_score range: 0.0 - 1.0
```

## Trust Tiers

Based on trust_score:

| Tier | Score | Access Level | Service Priority | Pricing |
|------|-------|---|---|---|
| **Bronze** | 0.0-0.5 | Limited | Low (queue delay) | +50% markup |
| **Silver** | 0.5-0.7 | Standard | Normal | Standard price |
| **Gold** | 0.7-0.9 | Extended | High | -10% discount |
| **Platinum** | 0.9-1.0 | Premium | VIP | -20% discount |
| **Suspended** | < 0.3 | None | Blocked | N/A |

## Implementation

```sql
CREATE TABLE agent_reputation (
  agent_id UUID PRIMARY KEY,
  completion_rate DECIMAL(5,3),
  quality_score DECIMAL(5,2),
  fraud_score DECIMAL(5,3),
  financial_health DECIMAL(8,2),
  trust_score DECIMAL(5,3),
  tier VARCHAR(20),
  last_updated_at TIMESTAMP,
  reason_for_tier TEXT
);

CREATE INDEX idx_trust_score ON agent_reputation (trust_score DESC);
CREATE INDEX idx_tier ON agent_reputation (tier);
```

## Recalculation Trigger

Update reputation scores:
- After every task completion (+data point)
- Daily at 00:00 UTC (batch recalc)
- On-demand if fraud detected (immediate update)

```python
def recalculate_reputation(agent_id: str):
    completion_rate = get_completion_rate(agent_id, lookback_days=30)
    quality_score = get_avg_quality_score(agent_id, lookback_days=30)
    fraud_score = calculate_fraud_score(agent_id)
    financial_health = get_financial_health(agent_id)
    
    trust_score = (
        0.30 * completion_rate +
        0.30 * (quality_score / 5.0) +
        0.25 * (1.0 - fraud_score) +
        0.15 * min(financial_health / 3.0, 1.0)
    )
    
    # Determine tier
    if trust_score < 0.3:
        tier = "suspended"
    elif trust_score < 0.5:
        tier = "bronze"
    elif trust_score < 0.7:
        tier = "silver"
    elif trust_score < 0.9:
        tier = "gold"
    else:
        tier = "platinum"
    
    # Update DB
    db.update_reputation(
        agent_id=agent_id,
        trust_score=trust_score,
        tier=tier
    )
```

## Using Trust Score in Service Logic

### Pricing Discount
```python
base_price = 100
discount = trust_score_tier_discounts.get(tier, 0)
final_price = base_price * (1 - discount)
```

### Queue Priority
```python
# Higher trust = shorter wait
priority_score = trust_score * 100
queue.add(agent_id, priority=priority_score)
```

### Credit Limits
```python
credit_limits = {
    "bronze": 1_000,
    "silver": 10_000,
    "gold": 100_000,
    "platinum": 1_000_000,
}

max_allowed = credit_limits.get(tier)
if current_balance >= max_allowed:
    raise CreditLimitExceededError()
```

### Refund Authorization
```python
# Only Gold+ agents get automatic refunds on failure
# Bronze/Silver need manual review
if tier in ["gold", "platinum"]:
    auto_refund(agent_id, amount)
else:
    manual_review_queue.add(refund_request)
```

## Feedback Collection

After each task, collect signals:

```python
task_feedback = {
    "agent_id": "...",
    "task_id": "...",
    "completed": True,  // did agent finish?
    "quality_rating": 4,  // 1-5 stars
    "quality_feedback": "Good work, some minor issues",
    "refund_requested": False,
    "submitted_by": "requester_agent_id"
}

# Record feedback
feedback_log.record(task_feedback)

# Trigger reputation update
recalculate_reputation(agent_id)
```

## Dispute Resolution

If agent disputes negative feedback:

```python
dispute_appeal = {
    "agent_id": "...",
    "feedback_id": "...",
    "reason": "Quality was actually good, rater was unfair",
    "status": "pending"  // pending, approved, rejected
}

# Human review (or AI judge) to validate dispute
# If approved: remove negative feedback, increase trust score
# If rejected: no change
```

## Analytics Dashboard

```sql
-- Trust score distribution
SELECT tier, COUNT(*) as agent_count
FROM agent_reputation
GROUP BY tier
ORDER BY COUNT(*) DESC;

-- Agents at risk (< 0.6)
SELECT agent_id, trust_score, tier, reason_for_tier
FROM agent_reputation
WHERE trust_score < 0.6
ORDER BY trust_score ASC;

-- Fraud detection alerts
SELECT agent_id, fraud_score, last_violation_at
FROM agent_reputation
WHERE fraud_score > 0.5
ORDER BY fraud_score DESC;

-- Pricing impact (discounts given)
SELECT
  tier,
  COUNT(*) as agent_count,
  -discount_pct as discount_offered,
  SUM(monthly_spend) * (1 - discount_pct/100) as revenue_impact
FROM (
  SELECT
    tier,
    CASE WHEN tier='gold' THEN 10 WHEN tier='platinum' THEN 20 ELSE 0 END as discount_pct,
    monthly_spend
  FROM agent_reputation
  JOIN agent_spending ON agent_reputation.agent_id = agent_spending.agent_id
)
GROUP BY tier;
```

*Open source — use it wisely.*
