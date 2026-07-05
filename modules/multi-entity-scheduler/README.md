# Multi-Entity Scheduler

Schedules recurring tasks across many entities with anti-detection techniques: per-entity phase offsets, jittered intervals, health + circadian checks.

## Features
- **Per-entity stagger**: Deterministic phase offset (from entity ID hash) prevents synchronization.
- **Jittered intervals**: Base interval scaled by random multiplier (0.5–1.6×).
- **Health checks**: Only runs if entity is available (respects cooldowns).
- **Circadian rhythm**: Respects entity sleep hours (writes only during awake hours).
- **Failure handling**: Auto-retries unavailable entities after cooldown.

## Usage
```python
from index import MultiEntityScheduler

scheduler = MultiEntityScheduler(
    base_interval_s=1500,      # 25 min base
    jitter=(0.5, 1.6),         # ±50% variation
    stagger_window_s=900,      # 15 min stagger window
    batch_writes=3
)

# In your event loop
campaigns = [
    {"id": "c1", "account_id": "acct_001", "enabled": True, "next_run_at": 0},
    {"id": "c2", "account_id": "acct_002", "enabled": True, "next_run_at": 0},
]

def check_available(entity_id: str):
    """Returns (available, cooldown_s, state)."""
    available, cd, state = my_sentinel.is_available(entity_id)
    return available, cd, state

def check_awake(entity_id: str, now: float):
    """True if entity is awake (respects sleep hours)."""
    hz = MyHumanizer(entity_id)
    return hz.is_awake()

def run_task(campaign: dict):
    """Execute campaign, return {writes, stopped, ...}."""
    result = my_executor.run(campaign["flow"])
    return {"writes": result.get("write_count", 0), "stopped": False}

# Tick every minute
report = scheduler.tick(campaigns, check_available, check_awake, run_task, now=time.time())
print(report)
# {
#   "now": 1234567890,
#   "ran": [{"campaign_id": "c1", "writes": 2, "stopped": False}],
#   "skipped": [{"campaign_id": "c2", "why": "sleeping"}]
# }
```

## Status
```python
status = scheduler.status(campaigns)
# [
#   {
#     "campaign_id": "c1",
#     "entity_id": "acct_001",
#     "next_run_at": 1234569000,
#     "due_in_s": 1110,
#     "status": "active"
#   },
#   ...
# ]
```

*Open source — use it wisely.*
