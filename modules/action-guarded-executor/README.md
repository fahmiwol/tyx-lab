# Action Guarded Executor

Universal executor wrapper with built-in guard layers. Simplifies wrapping any function with rate-limiting, health checks, and human-like delays.

## Features
- **Multi-layer guards**: Health → Circadian → Rate-Limit → Think Delay.
- **Structured results**: ActionResult dataclass with timing, error, signal classification.
- **Introspection logging**: All guard layers emit events (why they passed/failed).
- **Dependency injection**: Works with any rate_limiter/sentinel/humanizer.
- **No intrusion**: Your function stays unchanged.

## Usage
```python
from index import ActionExecutor, ActionResult

executor = ActionExecutor(
    rate_limiter=my_rate_limiter,
    sentinel=my_sentinel,
    humanizer_fn=lambda eid: MyHumanizer(eid)
)

def post_content():
    # Your actual action logic
    return {"posted_id": "123", "text": "Hello"}

result = executor.execute(
    entity_id="acct_001",
    action="post",
    fn=post_content,
    age_days=5.0,
    base_cap=50,
    min_interval=30.0,
    tz_offset_hours=7,
    is_write=True,
    blocking_delays=True
)

if result.ok:
    print(f"Success! Data: {result.data}")
    print(f"Waited: {result.waited_s}s, Duration: {result.duration_s}s")
else:
    print(f"Failed: {result.error} (signal={result.signal})")
    print(f"Retry in: {result.waited_s}s")

# Inspect events
for event in executor.get_log():
    print(event)
```

## ActionResult Fields
- `ok: bool` — Success/fail.
- `action: str` — Action name.
- `entity_id: str` — Entity ID.
- `data: Any` — Return value if ok.
- `error: str` — Error message if failed.
- `signal: str` — Signal type (ok, rate_limit, health, exception, etc.).
- `waited_s: float` — Seconds waited by guards.
- `duration_s: float` — Total execution time.

*Open source — use it wisely.*
