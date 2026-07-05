# Adaptive Rate Limiter with Warmup

Implements age-scaled rate limiting for multi-account systems (bots, workers) where new accounts should operate at reduced capacity until proven safe.

## Features
- **Warmup curve**: New accounts at 8%, ramping to 100% over ~21 days (configurable ease-out).
- **Per-action budgets**: Daily cap per action type with warm-up scaling.
- **Jittered intervals**: Minimum intervals between actions + random spread (e.g., 0.35) to avoid detection.
- **Persistent state**: Per-entity JSON storage survives restarts.
- **Timezone-aware**: Daily resets respect entity's timezone offset.

## Usage
```python
from index import AdaptiveRateLimiter

limiter = AdaptiveRateLimiter(storage_dir="storage/rate", ramp_days=21.0)

# Check if action allowed; consume budget if yes
allowed, wait_secs, reason = limiter.check_and_consume(
    entity_id="acct_123",
    action_key="post",
    age_days=5.0,
    base_cap=50,        # 50 posts per day max at full ramp
    min_interval=30.0,  # min 30s between posts (scaled up for young accounts)
    tz_offset_hours=7
)

if allowed:
    print("Go ahead")
else:
    print(f"Wait {wait_secs}s ({reason})")

# Check remaining budget without consuming
remaining = limiter.remaining(
    entity_id="acct_123",
    action_key="post",
    age_days=5.0,
    base_cap=50,
    tz_offset_hours=7
)
```

## Configuration
- `ramp_days` (default 21): Days to reach 100% budget.
- `storage_dir` (default "storage/rate"): Path to persist state.
- `spread` (default 0.35): Jitter range for intervals (±35%).

*Open source — use it wisely.*
