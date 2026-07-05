# Request Guard Sentinel

Health and safety state machine for distributed systems. Classifies error signals, tracks entity health, and enforces cooldowns.

## Features
- **Signal classification**: Regex-based pattern matching for challenge, rate-limit, blocked, auth-invalid.
- **3-state health**: HEALTHY → COOLING (throttled) → QUARANTINED (manual intervention).
- **Strike escalation**: 3 strikes → quarantine; OK signal reduces strikes.
- **Persistent history**: Keeps last 50 signals per entity; survives restarts.
- **Manual reset**: Support for re-login or captcha solve.

## Usage
```python
from index import RequestGuardSentinel, Signal

sentinel = RequestGuardSentinel(storage_dir="storage/health")

# Check availability
available, cooldown_s, state = sentinel.is_available("user_123")
if available:
    # proceed with request
    pass
else:
    if cooldown_s < 0:
        print("Quarantined — manual intervention needed")
    else:
        print(f"Cooling: wait {cooldown_s}s")

# Record result (automatically classifies error text)
new_state = sentinel.record("user_123", Signal.OK)

# Or classify custom error text
signal = classify_text("Captcha required")  # returns Signal.CHALLENGE
sentinel.record("user_123", signal)

# Reset after manual fix (e.g., re-login)
sentinel.reset("user_123")

# Fetch signal history
events = sentinel.history("user_123", limit=10)
# [ [timestamp, signal], ... ]
```

## State Machine
```
HEALTHY (available) 
    ↓ [CHALLENGE or AUTH_INVALID] 
QUARANTINED (unavailable, cooldown=-1) [requires reset()]

HEALTHY 
    ↓ [RATE_LIMIT or BLOCKED]
COOLING (unavailable, cooldown>0, auto-recovers)
    ↓ [3 strikes]
QUARANTINED
```

*Open source — use it wisely.*
