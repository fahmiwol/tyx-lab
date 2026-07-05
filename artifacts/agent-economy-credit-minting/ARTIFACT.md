# Agent-Economy Credit-Minting Design: Service Credits & Internal Currency

**Version:** 1.0.0 | **Category:** Business | **Status:** stable

## Overview

A framework for designing internal service credit systems (non-blockchain) that incentivize agent collaboration, prevent abuse, and enable frictionless service exchanges in multi-agent ecosystems. Applicable to agent platforms, game economies, or organizational micro-services.

## Core Design: The Credit Ledger

### Principle 1: Double-Entry Ledger

Every transaction records two sides (inspired by Islamic Hifz principles):
```
Agent-1 (Requester) —debit—> [Credit Pool]
                              [Credit Pool] —credit—> Agent-2 (Provider)
```

**Schema:**
```sql
CREATE TABLE credit_ledger (
  id UUID PRIMARY KEY,
  timestamp TIMESTAMP,
  type VARCHAR(50),  -- 'mint', 'transfer', 'burn', 'refund'
  from_agent_id UUID,
  to_agent_id UUID,
  amount_credits DECIMAL(18,6),
  reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP
);
```

### Principle 2: Four Core Operations

| Operation | From | To | Purpose | Example |
|-----------|------|-----|---------|---------|
| **Mint** | System | Agent | Issue new credits (reward, bootstrap) | Agent-1 completes task → +100 credits |
| **Transfer** | Agent A | Agent B | Payment for service | Agent-1 pays Agent-2 80 credits for data synthesis |
| **Burn** | Agent | System | Destroy credits (penalty, refund) | Fraud detected → burn 50 credits from bad agent |
| **Refund** | System | Agent | Return credits (failed service) | Agent-2 returned bad data → refund 80 credits |

### Principle 3: Minting Policy

Credits aren't printed infinitely. Define minting boundaries:

**Base Minting:** New agents start with 0 credits (earn through work)

```python
class MintingPolicy:
    # Conservative: Don't bootstrap everyone
    initial_credits_new_agent = 0
    
    # Earn credits by doing work
    credits_per_successful_task = 100
    
    # Limit daily inflation
    max_credits_minted_per_day = 1_000_000
    
    # Track system total
    total_credits_in_circulation = 5_000_000
    
    def can_mint(self, amount: int) -> bool:
        return (total_credits_in_circulation + amount <= max_total)
```

**Earned Minting:**
```
Task Completion: +100 credits
Quality Feedback (5-star): +10 bonus credits
Referral (new agent joins): +50 credits
Community Contribution: +5-50 credits
```

### Principle 4: Credit Metering (Usage)

Charges prevent hoarding and abuse:

```python
credit_costs = {
    "web_search": 1,
    "image_generation": 50,
    "video_generation": 200,
    "data_synthesis": 100,
    "code_review": 20,
    "prompt_engineering": 5,
    "model_inference": 0.1,  # very cheap
    "fail_penalty": -10,      # lose credits if task fails
}

def call_service(agent_id: str, service: str) -> Result:
    cost = credit_costs.get(service, 0)
    
    # Check balance
    if get_balance(agent_id) < cost:
        raise InsufficientCreditsError()
    
    # Debit
    ledger.record(from=agent_id, to="system", amount=cost, type="burn")
    
    # Execute service
    result = execute_service(service)
    
    # If failed, refund
    if not result.success:
        ledger.record(from="system", to=agent_id, amount=cost, type="refund")
    
    return result
```

## Design Pattern: Mint-Use-Burn Cycle

```
Day 1: System mints 1000 credits to Agent-A (reward for completing task)
       Balance: Agent-A = 1000

Day 2: Agent-A calls image_generation service (cost: 50 credits)
       50 credits burned (system)
       Balance: Agent-A = 950

Day 3: Agent-A pays Agent-B 200 credits for data (transfer)
       200 credits transferred from A to B
       Balance: Agent-A = 750, Agent-B = 200

Day 5: Agent-B completes task, gets minted 500 credits
       Balance: Agent-A = 750, Agent-B = 700

Day 10: System detects fraud in Agent-A's work
        500 credits burned (penalty)
        Balance: Agent-A = 250
```

## Incentive Alignment: Rewards & Penalties

### Positive Incentives
- Task completion: +100 credits
- Quality milestone (avg rating > 4.5): +10 credits
- Referral bonus: +50 credits when referred agent spends 500 credits
- Bug report accepted: +5-20 credits

### Negative Incentives (Penalties)
- Task rejection by reviewer: lose 20 credits
- False report (spam/fraud): lose 50 credits
- Repeated low quality (<3.0 avg): escalate penalties (lose 10, 20, 50 credits)
- System abuse (rate limit exceeded): automatic 100-credit burn

## Anti-Abuse Guards

```python
class AbuseDetection:
    def __init__(self):
        self.rate_limits = {
            "api_calls_per_min": 10,
            "credits_spent_per_day": 100_000,
            "credits_requested_per_min": 1000,
        }
    
    def check_before_transaction(self, agent_id: str, amount: int):
        # Check daily burn limit
        today_burned = get_burned_today(agent_id)
        if today_burned + amount > self.rate_limits["credits_spent_per_day"]:
            raise RateLimitError("Daily credit limit exceeded")
        
        # Check reputation before large transactions
        reputation = get_reputation(agent_id)
        if reputation.fraud_score > 0.7:
            raise FraudDetectionError("Suspicious activity detected")
        
        # Check balance double-spent protection
        if get_balance(agent_id) < amount:
            raise InsufficientFundsError()
```

## Reporting & Analytics

**Dashboard queries:**
```sql
-- Total credits in circulation
SELECT SUM(amount_credits) FROM credit_ledger WHERE type IN ('mint', 'transfer');

-- Per-agent balance (efficient cache)
CREATE TABLE agent_balance_cache (
  agent_id UUID PRIMARY KEY,
  balance_credits DECIMAL(18,6),
  updated_at TIMESTAMP
);

-- Daily minting volume
SELECT 
  DATE_TRUNC('day', created_at) as date,
  SUM(amount_credits) as minted_today
FROM credit_ledger
WHERE type = 'mint'
GROUP BY DATE_TRUNC('day', created_at);

-- Fraud detection: agents with negative balance
SELECT agent_id, SUM(amount_credits) as net_balance
FROM credit_ledger
GROUP BY agent_id
HAVING SUM(amount_credits) < 0;
```

## Generic Application

- Replace "credits" with your internal currency name
- Adjust mint rates, costs, and penalties to your economics
- Adapt to your services (swap image_generation with your domain-specific services)
- Use double-entry ledger for regulatory/audit trail
- Monitor daily inflation to prevent currency devaluation

*Open source — use it wisely.*
